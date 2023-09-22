/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { QueryFailedError } from 'typeorm'
import * as z from 'zod'
import { AppDataSource } from '../../database/dataSource'
import { MerchantEntity } from '../../entity/MerchantEntity'
import { MerchantLocationEntity } from '../../entity/MerchantLocationEntity'
import logger from '../../services/logger'
import { CheckoutCounterEntity } from '../../entity/CheckoutCounterEntity'

import {
  MerchantLocationSubmitDataSchema
} from '../schemas'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTransactionStatus } from 'shared-lib'
import { type AuthRequest } from 'src/types/express'

/**
 * @openapi
 * /merchants/{id}/locations:
 *   post:
 *     tags:
 *       - Merchants
 *       - Merchant Locations
 *     security:
 *       - Authorization: []
 *     summary: Create a new location for a Merchant
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
 *               location_type:
 *                 type: string
 *                 example: "Physical"
 *               web_url:
 *                 type: string
 *                 example: "http://www.example.com"
 *               address_type:
 *                 type: string
 *                 example: "Office"
 *               department:
 *                 type: string
 *                 example: "Sales"
 *               sub_department:
 *                 type: string
 *                 example: "Support"
 *               street_name:
 *                 type: string
 *                 example: "Main Street"
 *               building_number:
 *                 type: string
 *                 example: "123"
 *               building_name:
 *                 type: string
 *                 example: "Big Building"
 *               floor_number:
 *                 type: string
 *                 example: "4"
 *               room_number:
 *                 type: string
 *                 example: "101"
 *               post_box:
 *                 type: string
 *                 example: "PO Box 123"
 *               postal_code:
 *                 type: string
 *                 example: "12345"
 *               town_name:
 *                 type: string
 *                 example: "Townsville"
 *               district_name:
 *                 type: string
 *                 example: "District 1"
 *               country_subdivision:
 *                 type: string
 *                 example: "State"
 *               country:
 *                 type: string
 *                 example: "United States of America"
 *               address_line:
 *                 type: string
 *                 example: "123 Main Street, Townsville"
 *               latitude:
 *                 type: string
 *                 example: "40.7128"
 *               longitude:
 *                 type: string
 *                 example: "74.0060"
 *     responses:
 *       201:
 *         description: Merchant location created
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
export async function postMerchantLocation (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const id = Number(req.params.id)
  if (isNaN(id) || id < 1) {
    logger.error('Invalid ID')
    await audit(
      AuditActionType.ADD,
      AuditTransactionStatus.FAILURE,
      'postMerchantLocation',
      `Invalid ID: ${req.params.id}`,
      'Merchant',
      {}, {}, portalUser
    )
    res.status(422).send({ message: 'Invalid ID' })
    return
  }

  const locationData = req.body

  // Validate the Request Body
  try {
    MerchantLocationSubmitDataSchema.parse(locationData)
  } catch (err) {
    if (err instanceof z.ZodError) {
      logger.error('Merchant Location Validation error: %o', err.issues.map(issue => issue.message))
      await audit(
        AuditActionType.ADD,
        AuditTransactionStatus.FAILURE,
        'postMerchantLocation',
        'Merchant Location Validation error',
        'Merchant',
        {}, locationData, portalUser
      )
      return res.status(422).send({ message: err.issues.map(issue => issue.message) })
    }
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const locationRepository = AppDataSource.getRepository(MerchantLocationEntity)

  const merchant = await merchantRepository.findOne({
    where: { id },
    relations: [
      'checkout_counters',
      'dfsps'
    ]
  })

  if (merchant == null) {
    logger.error('Merchant not found')
    await audit(
      AuditActionType.ADD,
      AuditTransactionStatus.FAILURE,
      'postMerchantLocation',
      `Merchant not found: ${req.params.id}`,
      'Merchant',
      {}, locationData, portalUser
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
      AuditTransactionStatus.FAILURE,
      'postMerchantLocation',
          `User ${portalUser.id} (${portalUser.email}) 
trying to access unauthorized(different DFSP) merchant ${merchant.id}`,
          'MerchantEntity',
          {}, {}, portalUser
    )
    return res.status(400).send({
      message: 'Accessing different DFSP\'s Merchant is not allowed.'
    })
  }

  const newLocation = locationRepository.create({
    ...locationData,
    merchant
  })

  let savedLocation
  try {
    savedLocation = await locationRepository.save(newLocation)
  } catch (err) {
    if (err instanceof QueryFailedError) {
      logger.error('Query Failed: %o', err.message)
      await audit(
        AuditActionType.ADD,
        AuditTransactionStatus.FAILURE,
        'postMerchantLocation',
        'Query Failed',
        'Merchant',
        {}, newLocation, portalUser
      )
      return res.status(500).send({ message: err.message })
    }
  }

  if (merchant.checkout_counters.length > 0) {
    if (req.body.checkout_description !== undefined) {
      merchant.checkout_counters[0].description = req.body.checkout_description
    }
    if (savedLocation instanceof MerchantLocationEntity) {
      logger.debug('Saved Location for checkoutcoutner: %o', savedLocation)
      merchant.checkout_counters[0].checkout_location = savedLocation
    }

    try {
      await AppDataSource.getRepository(CheckoutCounterEntity).update(
        merchant.checkout_counters[0].id,
        merchant.checkout_counters[0]
      )
    } catch (err) {
      if (err instanceof QueryFailedError) {
        logger.error('Query Failed: %o', err.message)
        await audit(
          AuditActionType.ADD,
          AuditTransactionStatus.FAILURE,
          'postMerchantLocation',
          'Query Failed',
          'Merchant',
          {}, locationData, portalUser
        )
        return res.status(500).send({ message: err.message })
      }
    }
  } else {
    logger.error('Merchant Checkout Counter not found')
    return res.status(404).json({ message: 'Merchant Checkout Counter not found' })
  }

  savedLocation = {
    ...savedLocation,
    merchant: { id: merchant.id }
  }

  await audit(
    AuditActionType.ADD,
    AuditTransactionStatus.SUCCESS,
    'postMerchantLocation',
    'Merchant Location Saved',
    'Merchant',
    {}, savedLocation ?? {}, portalUser
  )
  return res.status(201).send({ message: 'Merchant Location Saved', data: savedLocation })
}
