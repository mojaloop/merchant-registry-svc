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
 * /merchants/{id}/contact-persons:
 *   post:
 *     tags:
 *       - Merchants
 *       - Contact Persons
 *     security:
 *       - Authorization: []
 *     summary: Create a new contact person for a Merchant
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *        required: true
 *        description: Numeric ID of the Merchant Record
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
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               phone_number:
 *                 type: string
 *                 example: "123-456-7890"
 *     responses:
 *       201:
 *         description: Contact Person Saved
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
export async function postMerchantContactPerson (req: AuthRequest, res: Response) {
  const portalUser = req.user

  /* istanbul ignore if */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const id = Number(req.params.id)
  if (isNaN(id) || id < 1) {
    logger.error('Invalid ID')
    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.FAILURE,
      'postMerchantContactPerson',
      `Invalid ID: ${req.params.id}`,
      'Merchant',
      {}, {}, null
    )
    res.status(422).send({ message: 'Invalid ID' })
    return
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const contactPersonRepository = AppDataSource.getRepository(ContactPersonEntity)

  const merchant = await merchantRepository.findOne(
    {
      where: { id },
      relations: [
        'business_owners', // for is_same_as_business_owner option
        'created_by',
        'dfsps'
      ]
    }
  )

  if (merchant == null) {
    logger.error('Merchant not found')
    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.FAILURE,
      'postMerchantContactPerson',
      `Merchant not found: ${req.params.id}`,
      'Merchant',
      {}, {}, portalUser
    )

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
      'postMerchantContactPerson',
          `User ${portalUser.id} (${portalUser.email}) 
trying to access unauthorized(different DFSP) merchant ${merchant.id}`,
          'MerchantEntity',
          {}, {}, portalUser
    )
    return res.status(400).send({
      message: 'Accessing different DFSP\'s Merchant is not allowed.'
    })
  }

  if (merchant.created_by.id !== portalUser.id) {
    merchant.created_by = portalUser
    try {
      await merchantRepository.save(merchant)
    } catch (e) {
      const msg = 'Failed to update created_by user when adding new contact person'
      logger.error(msg)
      return res.status(400).json({ message: msg })
    }
  }

  const newContactPerson = contactPersonRepository.create({})
  if (req.body.is_same_as_business_owner === true) {
    const businessOwners = merchant.business_owners
    if (businessOwners == null || businessOwners.length === 0) {
      logger.error('Business Owner not found')
      await audit(
        AuditActionType.ADD,
        AuditTrasactionStatus.FAILURE,
        'postMerchantContactPerson',
        `Business Owner not found: ${req.params.id}`,
        'Merchant',
        {}, {}, portalUser
      )

      return res.status(404).json({ message: 'Business Owner not found' })
    }

    // Create a new Contact Person record from the Business Owner record
    newContactPerson.name = businessOwners[0].name
    newContactPerson.email = businessOwners[0].email
    newContactPerson.phone_number = businessOwners[0].phone_number
    newContactPerson.businessPersonLocation = businessOwners[0].businessPersonLocation
    newContactPerson.merchant = merchant
  } else {
    // Validate the Request Body
    const contactPersonData = req.body
    try {
      ContactPersonSubmitDataSchema.parse(contactPersonData)
    } catch (err) {
      if (err instanceof z.ZodError) {
        logger.error('Contact Person Validation error: %o', err.issues.map(issue => issue.message))
        await audit(
          AuditActionType.ADD,
          AuditTrasactionStatus.FAILURE,
          'postMerchantContactPerson',
          'Contact Person Validation error',
          'Merchant',
          {}, contactPersonData, portalUser
        )
        return res.status(422).send({ message: err.issues.map(issue => issue.message) })
      }
    }
    // Create a new Contact Person record from the Request Body
    newContactPerson.name = contactPersonData.name
    newContactPerson.email = contactPersonData.email
    newContactPerson.phone_number = contactPersonData.phone_number
    newContactPerson.merchant = merchant
  }

  let savedContactPerson: ContactPersonEntity | null = null
  try {
    savedContactPerson = await contactPersonRepository.save(newContactPerson)
  } catch (err) {
    if (err instanceof QueryFailedError)/* istanbul ignore next */ {
      logger.error('Contact Person Server Query error: %o', err.message)
      await audit(
        AuditActionType.ADD,
        AuditTrasactionStatus.FAILURE,
        'postMerchantContactPerson',
        'Contact Person Server Query error',
        'Merchant',
        {}, { ...newContactPerson, merchant: undefined }, portalUser
      )
      return res.status(422).send({ message: err.message })
    }
  }

  await audit(
    AuditActionType.ADD,
    AuditTrasactionStatus.SUCCESS,
    'postMerchantContactPerson',
    'Contact Person Saved',
    'Merchant',
    {}, { ...savedContactPerson, merchant: undefined } ?? {}, portalUser
  )

  return res.status(201).send({
    message: 'Contact Person Saved',
    data: savedContactPerson
  })
}
