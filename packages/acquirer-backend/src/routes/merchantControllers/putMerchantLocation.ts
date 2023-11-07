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
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { type AuthRequest } from 'src/types/express'

/**
 * @openapi
 * /merchants/{merchantId}/locations/{locationId}:
 *   put:
 *     tags:
 *       - Merchants
 *       - Merchant Locations
 *     security:
 *       - Authorization: []
 *     summary: Update old location for a Merchant
 *     parameters:
 *      - in: path
 *        name: merchantId
 *        schema:
 *          type: number
 *        required: true
 *        description: Numeric ID of the Merchant Record
 *      - in: path
 *        name: locationId
 *        schema:
 *          type: number
 *        required: true
 *        description: Numeric ID of the Location
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
 *       200:
 *         description: Merchant Location Updated
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
export async function putMerchantLocation (req: AuthRequest, res: Response) {
  const portalUser = req.user

  /* istanbul ignore if  */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const merchantId = Number(req.params.merchantId)
  if (isNaN(merchantId) || merchantId < 1) {
    logger.error('Invalid Merchant ID')
    res.status(422).send({ message: 'Invalid Merchant ID' })
    return
  }

  const locationId = Number(req.params.locationId)
  if (isNaN(locationId) || locationId < 1) {
    logger.error('Invalid Location ID')
    res.status(422).send({ message: 'Invalid Location ID' })
    return
  }

  const locationData = req.body

  // Validate the Request Body
  try {
    MerchantLocationSubmitDataSchema.parse(locationData)
  } catch (err) {
    if (err instanceof z.ZodError) {
      logger.error('Merchant Location Validation error: %o', err.issues.map(issue => issue.message))
      return res.status(422).send({ message: err.issues.map(issue => issue.message) })
    }
  }

  // Find merchant
  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const merchant = await merchantRepository.findOne({
    where: { id: merchantId },
    relations: [
      'locations',
      'locations.checkout_counters',
      'dfsps'
    ]
  })
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
      'putMerchantLocation',
          `User ${portalUser.id} (${portalUser.email}) 
trying to access unauthorized(different DFSP) merchant ${merchant.id}`,
          'MerchantEntity',
          {}, { merchantId, locationId, body: req.body }, portalUser
    )
    return res.status(400).send({
      message: 'Accessing different DFSP\'s Merchant is not allowed.'
    })
  }

  // Find Location
  const location = merchant.locations.find(location => location.id === locationId)
  if (location == null || location === undefined) {
    logger.error('Merchant Location not found')
    return res.status(404).json({ message: 'Merchant Location not found' })
  }

  if (location.checkout_counters.length !== 0) {
    // Assuming one checkoutout counter, one location, and one merchant
    const checkoutDescription: string = req.body.checkout_description
    if (checkoutDescription !== null && checkoutDescription !== '') {
      location.checkout_counters[0].description = req.body.checkout_description

      try {
        await AppDataSource.getRepository(CheckoutCounterEntity).update(
          location.checkout_counters[0].id,
          location.checkout_counters[0]
        )
      } catch (err)/* istanbul ignore next */ {
        if (err instanceof QueryFailedError) {
          logger.error('Query Failed: %o', err.message)
          return res.status(500).send({ message: err.message })
        }
      }
    }
  }

  locationData.checkout_description = undefined

  try {
    await AppDataSource.getRepository(MerchantLocationEntity).update(
      location.id,
      locationData
    )
  } catch (err) {
    if (err instanceof QueryFailedError) /* istanbul ignore next */ {
      logger.error('Query Failed: %o', err.message)
      return res.status(500).send({ message: err.message })
    }
  }

  await audit(
    AuditActionType.UPDATE,
    AuditTrasactionStatus.SUCCESS,
    'putMerchantLocation',
    'Merchant Location Updated',
    'MerchantLocationEntity',
    {}, { merchantId, locationId, body: req.body }, portalUser
  )
  return res.status(200).send({ message: 'Merchant Location Updated' })
}
