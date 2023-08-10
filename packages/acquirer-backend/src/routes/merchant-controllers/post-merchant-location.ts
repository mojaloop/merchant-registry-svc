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

/**
 * @openapi
 * /merchants/{id}/locations:
 *   post:
 *     tags:
 *       - Merchants
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
export async function postMerchantLocation (req: Request, res: Response) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    logger.error('Invalid ID')
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
      return res.status(422).send({ error: err.issues.map(issue => issue.message) })
    }
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const locationRepository = AppDataSource.getRepository(MerchantLocationEntity)

  const merchant = await merchantRepository.findOne({
    where: { id },
    relations: [
      'checkout_counters'
    ]
  })

  if (merchant == null) {
    logger.error('Merchant not found')
    return res.status(404).json({ error: 'Merchant not found' })
  }

  const newLocation = locationRepository.create({
    ...locationData,
    merchant
  })

  const savedLocation = await locationRepository.save(newLocation)

  const checkoutDescription: string = req.body.checkout_description
  if (checkoutDescription !== null && checkoutDescription !== '') {
    if (merchant.checkout_counters.length > 0) {
      merchant.checkout_counters[0].description = req.body.checkout_description
      if (savedLocation instanceof MerchantLocationEntity) {
        logger.info('Saved Location for checkoutcoutner: %o', savedLocation)
        merchant.checkout_counters[0].checkout_location = savedLocation as MerchantLocationEntity
      }

      try {
        await AppDataSource.getRepository(CheckoutCounterEntity).update(
          merchant.checkout_counters[0].id,
          merchant.checkout_counters[0]
        )
      } catch (err) {
        if (err instanceof QueryFailedError) {
          logger.error('Query Failed: %o', err.message)
          return res.status(500).send({ error: err.message })
        }
      }
    } else {
      logger.error('Merchant Checkout Counter not found')
      return res.status(404).json({ error: 'Merchant Checkout Counter not found' })
    }
  }

  return res.status(201).send({ message: 'Merchant Location Saved', data: savedLocation })
}
