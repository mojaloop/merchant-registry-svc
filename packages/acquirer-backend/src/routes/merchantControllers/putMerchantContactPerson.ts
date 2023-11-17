/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { QueryFailedError } from 'typeorm'
import * as z from 'zod'
import { AppDataSource } from '../../database/dataSource'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import { ContactPersonEntity } from '../../entity/ContactPersonEntity'

import {
  ContactPersonSubmitDataSchema
} from '../schemas'

import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { type AuthRequest } from 'src/types/express'

/**
 * @openapi
 *
 * tags:
 *   name: Contact Persons
 *
 * /merchants/{merchantId}/contact-persons/{contactPersonId}:
 *   put:
 *     tags:
 *       - Merchants
 *       - Contact Persons
 *     security:
 *       - Authorization: []
 *     summary: Update contact person of Merchant
 *     parameters:
 *      - in: path
 *        name: merchantId
 *        schema:
 *          type: number
 *        required: true
 *        description: Numeric ID of the Merchant Record
 *      - in: path
 *        name: contactPersonId
 *        schema:
 *          type: number  # Fixed the indentation here
 *        required: true
 *        description: Numeric ID of the Contact Person
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_same_as_business_owner:
 *                 type: boolean
 *                 example: false
 *               name:
 *                 type: string
 *                 example: "John Doe Updated 2"
 *               email:
 *                 type: string
 *                 example: "john.doe.updated.2@example.com"
 *               phone_number:
 *                 type: string
 *                 example: "123-456-7890-333"
 *     responses:
 *       200:
 *         description: Contact Person Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */
export async function putMerchantContactPerson (req: AuthRequest, res: Response) {
  const portalUser = req.user

  /* istanbul ignore if */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const merchantId = Number(req.params.merchantId)
  if (isNaN(merchantId) || merchantId < 1) {
    logger.error('Invalid Merchant ID')
    res.status(422).send({ message: 'Invalid Merchant ID' })
    return
  }

  const contactPersonId = Number(req.params.contactPersonId)
  if (isNaN(contactPersonId) || contactPersonId < 1) {
    logger.error('Invalid Contact Person ID')
    res.status(422).send({ message: 'Invalid Contact Person ID' })
    return
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const contactPersonRepository = AppDataSource.getRepository(ContactPersonEntity)

  const merchant = await merchantRepository.findOne(
    {
      where: { id: merchantId },
      relations: [
        'business_owners', // for is_same_as_business_owner
        'contact_persons',
        'created_by',
        'dfsps'
      ]
    }
  )

  if (merchant == null) {
    logger.error('Merchant not found')
    return res.status(404).json({ message: 'Merchant not found' })
  }

  const validMerchantForUser = merchant.dfsps
    .map(dfsp => dfsp.id)
    .includes(portalUser.dfsp.id)
  if (!validMerchantForUser) {
    logger.error('Accessing different DFSP\'s Merchant is not allowed.')
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'putWaitingAliasGeneration',
          `User ${portalUser.id} (${portalUser.email}) 
trying to access unauthorized(different DFSP) merchant ${merchant.id}`,
          'MerchantEntity',
          {}, {}, portalUser
    )
    return res.status(400).send({
      message: 'Accessing different DFSP\'s Merchant is not allowed.'
    })
  }

  const contactPerson = merchant.contact_persons.find(
    contactPerson => contactPerson.id === contactPersonId
  )

  if (contactPerson == null) {
    logger.error('Contact Person not found')
    return res.status(404).json({ message: 'Contact Person not found' })
  }

  const oldContactPerson = { ...contactPerson, merchant: null }// Deep clone for audit log

  if (req.body.is_same_as_business_owner === true) {
    const businessOwners = merchant.business_owners
    if (businessOwners == null || businessOwners.length === 0) {
      logger.error('Business Owner not found to be able to copy to Contact Person')
      return res.status(404).json({
        message: 'Business Owner not found to be able to copy to Contact Person'
      })
    }

    // Create a new Contact Person record from the Business Owner record
    contactPerson.name = businessOwners[0].name
    contactPerson.email = businessOwners[0].email
    contactPerson.phone_number = businessOwners[0].phone_number
    contactPerson.businessPersonLocation = businessOwners[0].businessPersonLocation
    contactPerson.merchant = merchant
  } else {
    // Validate the Request Body
    const contactPersonData = req.body
    try {
      ContactPersonSubmitDataSchema.parse(contactPersonData)
    } catch (err) {
      if (err instanceof z.ZodError) {
        logger.error('Contact Person Validation error: %o', err.issues.map(issue => issue.message))
        return res.status(422).send({ message: err.issues.map(issue => issue.message) })
      }
    }
    // Create a new Contact Person record from the Request Body
    contactPerson.name = contactPersonData.name
    contactPerson.email = contactPersonData.email
    contactPerson.phone_number = contactPersonData.phone_number
    contactPerson.merchant = merchant
  }

  try {
    await contactPersonRepository.save(contactPerson)
  } catch (err)/* istanbul ignore next */ {
    if (err instanceof QueryFailedError) {
      logger.error('Contact Person DB Save error: %o', err.message)
      return res.status(422).send({ message: err.message })
    }
  }

  // Update the created_by field if portalUser is not the same as the current created_by
  if (merchant.created_by.id !== portalUser.id) {
    merchant.created_by = portalUser
    try {
      await merchantRepository.save(merchant)
    } catch (err)/* istanbul ignore next */ {
      if (err instanceof QueryFailedError) {
        logger.error('Merchant DB Save error (updating created_by): %o', err.message)
        return res.status(422).send({ message: err.message })
      }
    }
  }

  await audit(
    AuditActionType.UPDATE,
    AuditTrasactionStatus.SUCCESS,
    'putMerchantContactPerson',
    'Contact Person Updated',
    'ContactPerson',
    oldContactPerson, { ...contactPerson, merchant: null }, portalUser
  )

  return res.status(200).send({
    message: 'Contact Person Updated'
  })
}
