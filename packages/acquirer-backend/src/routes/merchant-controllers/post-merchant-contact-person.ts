/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Request, type Response } from 'express'
import { QueryFailedError } from 'typeorm'
import * as z from 'zod'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../logger'
import { ContactPersonEntity } from '../../entity/ContactPersonEntity'

import {
  ContactPersonSubmitDataSchema
} from '../schemas'

/**
 * @openapi
 * /merchants/{id}/contact-persons:
 *   post:
 *     tags:
 *       - Merchants
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
export async function postMerchantContactPerson (req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    logger.error('Invalid ID')
    res.status(422).send({ message: 'Invalid ID' })
    return
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const contactPersonRepository = AppDataSource.getRepository(ContactPersonEntity)

  const merchant = await merchantRepository.findOne(
    {
      where: { id },
      relations: ['business_owners'] // for is_same_as_business_owner option
    }
  )

  if (merchant == null) {
    logger.error('Merchant not found')
    return res.status(404).json({ error: 'Merchant not found' })
  }

  const newContactPerson = contactPersonRepository.create({})
  if (req.body.is_same_as_business_owner === true) {
    const businessOwners = merchant.business_owners
    if (businessOwners == null || businessOwners.length === 0) {
      logger.error('Business Owner not found')
      return res.status(404).json({ error: 'Business Owner not found' })
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
        return res.status(422).send({ error: err.issues.map(issue => issue.message) })
      }
    }
    // Create a new Contact Person record from the Request Body
    newContactPerson.name = contactPersonData.name
    newContactPerson.email = contactPersonData.email
    newContactPerson.phone_number = contactPersonData.phone_number
    newContactPerson.merchant = merchant
  }

  try {
    await contactPersonRepository.save(newContactPerson)
  } catch (err) {
    if (err instanceof QueryFailedError) {
      logger.error('Contact Person Validation error: %o', err.message)
      return res.status(422).send({ error: err.message })
    }
  }

  return res.status(201).send({
    message: 'Contact Person Saved',
    data: newContactPerson
  })
}
