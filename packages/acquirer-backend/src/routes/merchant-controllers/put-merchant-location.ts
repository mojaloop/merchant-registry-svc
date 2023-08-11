/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Request, type Response } from 'express'
import { QueryFailedError } from 'typeorm'
import * as z from 'zod'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import { MerchantLocationEntity } from '../../entity/MerchantLocationEntity'
import logger from '../../logger'
import { CheckoutCounterEntity } from '../../entity/CheckoutCounterEntity'

import {
  MerchantLocationSubmitDataSchema
} from '../schemas'
import { getAuthenticatedPortalUser } from '../../middleware/authenticate'

/**
 * @openapi
 * /merchants/{merchantId}/locations/{locationId}:
 *   put:
 *     tags:
 *       - Merchants
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
export async function putMerchantLocation (req: Request, res: Response) {
  const portalUser = await getAuthenticatedPortalUser(req.headers.authorization)
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
      // 'checkout_counters',
      'locations',
      'locations.checkout_counters'

    ]
  })
  if (merchant == null) {
    logger.error('Merchant not found')
    return res.status(404).json({ message: 'Merchant not found' })
  }

  // Find Location
  const location = merchant.locations.find(location => location.id === locationId)
  if (location == null || location === undefined) {
    logger.error('Merchant Location not found')
    return res.status(404).json({ message: 'Merchant Location not found' })
  }

  if (location.checkout_counters == null || location.checkout_counters.length === 0) {
    logger.error('location\'s Checkout Counter not found')
    return res.status(404).json({ message: 'location\'s Checkout Counter not found' })
  }

  // Assuming one checkoutout counter, one location, and one merchant
  const checkoutDescription: string = req.body.checkout_description
  if (checkoutDescription !== null && checkoutDescription !== '') {
    location.checkout_counters[0].description = req.body.checkout_description

    try {
      await AppDataSource.getRepository(CheckoutCounterEntity).update(
        location.checkout_counters[0].id,
        location.checkout_counters[0]
      )
    } catch (err) {
      if (err instanceof QueryFailedError) {
        logger.error('Query Failed: %o', err.message)
        return res.status(500).send({ message: err.message })
      }
    }
  }

  try {
    await AppDataSource.getRepository(MerchantLocationEntity).update(
      location.id,
      locationData
    )
  } catch (err) {
    if (err instanceof QueryFailedError) {
      logger.error('Query Failed: %o', err.message)
      return res.status(500).send({ message: err.message })
    }
  }

  return res.status(200).send({ message: 'Merchant Location Updated' })
}
