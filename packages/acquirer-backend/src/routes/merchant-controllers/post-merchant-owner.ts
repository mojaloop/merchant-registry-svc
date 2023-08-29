/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import * as z from 'zod'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import { BusinessOwnerEntity } from '../../entity/BusinessOwnerEntity'
import { BusinessPersonLocationEntity } from '../../entity/BusinessPersonLocationEntity'

import {
  BusinessOwnerSubmitDataSchema
} from '../schemas'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { type AuthRequest } from 'src/types/express'

/**
 * @openapi
 * /merchants/{id}/business-owners:
 *   post:
 *     tags:
 *       - Merchants
 *       - Business Owners
 *     security:
 *       - Authorization: []
 *     summary: Create a new business owner for a Merchant
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
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               phone_number:
 *                 type: string
 *                 example: "1234567890"
 *               identificaton_type:
 *                 type: string
 *                 example: "National ID"
 *               identification_number:
 *                 type: string
 *                 example: "123456789"
 *               country:
 *                 type: string
 *                 example: "Australia"
 *               country_subdivision:
 *                 type: string
 *                 example: "State"
 *               address_line:
 *                 type: string
 *                 example: "123 Main Street, Townsville"
 *               latitude:
 *                 type: string
 *                 example: "40.7128"
 *               longitude:
 *                 type: string
 *                 example: "74.0060"
 *
 *     responses:
 *       201:
 *         description: Business Owner Saved
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
export async function postMerchantOwner (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }
  const id = Number(req.params.id)
  if (isNaN(id) || id <= 0) {
    logger.error('Invalid ID')
    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.FAILURE,
      'postMerchantOwner',
      `Invalid ID: ${req.params.id}`,
      'Merchant',
      {}, {}, portalUser
    )
    res.status(422).send({ message: 'Invalid ID' })
    return
  }

  const businessOwnerData = req.body

  // Validate the Request Body
  try {
    BusinessOwnerSubmitDataSchema.parse(businessOwnerData)
  } catch (err) {
    if (err instanceof z.ZodError) {
      logger.error('Business Owner Validation error: %o', err.issues.map(issue => issue.message))
      await audit(
        AuditActionType.ADD,
        AuditTrasactionStatus.FAILURE,
        'postMerchantOwner',
        'Business Owner Validation error',
        'BusinessOwner',
        {}, businessOwnerData, portalUser
      )
      return res.status(422).send({ message: err })
    }
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const businessOwnerRepository = AppDataSource.getRepository(BusinessOwnerEntity)
  const locationRepository = AppDataSource.getRepository(BusinessPersonLocationEntity)

  const merchant = await merchantRepository.findOne(
    {
      where: { id },
      relations: ['business_owners']
    }
  )

  if (merchant == null) {
    logger.error('Merchant not found')
    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.FAILURE,
      'postMerchantOwner',
      `Merchant not found: ${req.params.id}`,
      'Merchant',
      {}, {}, portalUser
    )
    return res.status(404).json({ message: 'Merchant not found' })
  }

  const locationObj = locationRepository.create({
    ...businessOwnerData
  })

  let savedLocation: BusinessPersonLocationEntity | null = null
  try {
    logger.debug('creating location obj: %o', locationObj)
    // use 'as any' to solve eslint typecast issue.
    savedLocation = await locationRepository.save(locationObj as any)
    // businessOwner.businessPersonLocation = savedLocation
  } catch (err) {
    logger.error('error creating business owner location: %o', err)
    return res.status(500).send({ message: 'error creating business owner location' })
  }

  const businessOwner: BusinessOwnerEntity = businessOwnerRepository.create({})

  businessOwner.name = businessOwnerData.name
  businessOwner.phone_number = businessOwnerData.phone_number
  businessOwner.email = businessOwnerData.email
  businessOwner.identificaton_type = businessOwnerData.identificaton_type
  businessOwner.identification_number = businessOwnerData.identification_number
  if (savedLocation !== null) {
    businessOwner.businessPersonLocation = savedLocation
  }

  logger.debug('%o', businessOwner)

  try {
    await businessOwnerRepository.save(businessOwner)
  } catch (err) {
    logger.error('error creating business owner: %o', err)
    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.FAILURE,
      'postMerchantOwner',
      'Error creating business owner',
      'BusinessOwner',
      {}, businessOwnerData, portalUser
    )
    return res.status(500).send({ message: 'error creating business owner' })
  }

  if (merchant.business_owners == null || merchant.business_owners.length === 0) {
    merchant.business_owners = [businessOwner]
  } else {
    merchant.business_owners.push(businessOwner)
  }
  try {
    await merchantRepository.save(merchant)
  } catch (err) {
    logger.error('error updating merchant with business owner: %o', err)
    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.FAILURE,
      'postMerchantOwner',
      'Error updating merchant with business owner',
      'Merchant',
      {}, businessOwnerData, portalUser
    )
    return res.status(500).send({ message: 'error updating merchant with business owner' })
  }

  await audit(
    AuditActionType.ADD,
    AuditTrasactionStatus.SUCCESS,
    'postMerchantOwner',
    'Business Owner Saved',
    'BusinessOwner',
    {}, businessOwnerData, portalUser
  )

  return res.status(201).send({
    message: 'Business Owner Saved',
    data: businessOwner
  })
}
