/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Request, type Response } from 'express'
import { QueryFailedError } from 'typeorm'
import * as z from 'zod'
import { AppDataSource } from '../database/data-source'
import { MerchantEntity } from '../entity/MerchantEntity'
import { MerchantLocationEntity } from '../entity/MerchantLocationEntity'
import logger from '../logger'
import { CheckoutCounterEntity } from '../entity/CheckoutCounterEntity'
import { ContactPersonEntity } from '../entity/ContactPersonEntity'
import { BusinessOwnerEntity } from '../entity/BusinessOwnerEntity'
import {
  MerchantAllowBlockStatus,
  MerchantRegistrationStatus
} from 'shared-lib'

import {
  MerchantSubmitDataSchema,
  MerchantLocationSubmitDataSchema,
  ContactPersonSubmitDataSchema,
  BusinessOwnerSubmitDataSchema
} from './schemas'

const router = express.Router()

/**
 * @openapi
 * /merchants:
 *   get:
 *     tags:
 *       - Merchants
 *     summary: GET Merchants List
 *     responses:
 *       200:
 *         description: GET Merchants List
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The response message
 *                   example: OK
 *                 data:
 *                   type: array
 *                   description: The list of merchants
 *                   items:
 *                     type: object
 *
 */
// TODO: Protect the route
router.get('/merchants', async (req: Request, res: Response) => {
  // TODO: Filtering... e.g. by status
  try {
    const merchantRepository = AppDataSource.getRepository(MerchantEntity)
    const merchants = await merchantRepository.find({})
    res.send({ message: 'OK', data: merchants })
  } catch (e) {
    logger.error(e)
    res.status(500).send({ message: e })
  }
})

/**
 * @openapi
 * /merchants/{id}:
 *   get:
 *     tags:
 *       - Merchants
 *     summary: GET Merchant by ID
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *        required: true
 *        description: Numeric ID of the Merchant Record
 *     responses:
 *       200:
 *         description: GET Merchant by ID
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
// TODO: Protect the route
router.get('/merchants/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      logger.error('Invalid ID')
      res.status(422).send({ message: 'Invalid ID' })
      return
    }
    const merchantRepository = AppDataSource.getRepository(MerchantEntity)
    const merchant = await merchantRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: [
        'locations',
        'checkout_counters',
        'business_licenses',
        'contact_persons'
      ]
    })
    if (merchant == null) {
      return res.status(404).send({ message: 'Merchant not found' })
    }
    res.send({ message: 'OK', data: merchant })
  } catch (e) {
    logger.error(e)
    res.status(500).send({ message: e })
  }
})

/**
 * @openapi
 * /merchants/draft:
 *   post:
 *     tags:
 *       - Merchants
 *     summary: Create a new Merchant Draft
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dba_trading_name:
 *                 type: string
 *                 description: "The DBA Trading Name of the merchant"
 *                 example: "Merchant 1"
 *               registered_name:
 *                 type: string
 *                 description: "The Registered Name of the merchant"
 *                 example: "Merchant 1"
 *               employees_num:
 *                 type: string
 *                 description: "The number of employees of the merchant"
 *                 example: "1 - 10"
 *               monthly_turnover:
 *                 type: number
 *                 description: "The monthly turnover percentage of the merchant"
 *                 example: 0.5
 *               currency_code:
 *                 type: string
 *                 description: "The currency code of the merchant"
 *                 example: "PHP"
 *               category_code:
 *                 type: string
 *                 description: "The merchant SIC category code"
 *                 example: "10410"
 *               payinto_alias:
 *                 type: string
 *                 description: "The PayInto alias of the merchant"
 *                 example: "merchant1"
 *                 required: false
 *
 *     responses:
 *       200:
 *         description:
 *          The merchant draft has been created successfully.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Drafting Merchant Successful."
 *                data:
 *                  type: object
 *
 *       422:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
// TODO: Protect the route with User Authentication (Keycloak)
// TODO: check if the authenticated user is a Maker
router.post('/merchants/draft', async (req: Request, res: Response) => {
  // Validate the Request Body
  try {
    MerchantSubmitDataSchema.parse(req.body)
  } catch (err) {
    if (err instanceof z.ZodError) {
      logger.error('Validation error: %o', err.issues.map((issue) => issue.message))
      return res.status(422).send({ error: err.issues.map((issue) => issue.message) })
    }
  }

  // PayInto Alias is set, then create checkout counter
  let checkoutCounter = null
  if (
    req.body.payinto_alias !== undefined &&
    req.body.payinto_alias !== null &&
      req.body.payinto_alias !== ''
  ) {
    // TODO: Talk to Merchant Registry Oracle Service to create merchant_registry_id first ?
    checkoutCounter = await AppDataSource.manager.findOne(
      CheckoutCounterEntity,
      { where: { alias_value: req.body.payinto_alias } }
    )
    if (checkoutCounter === null) {
      checkoutCounter = new CheckoutCounterEntity()
      checkoutCounter.alias_value = req.body.payinto_alias

      try {
        await AppDataSource.manager.save(checkoutCounter)
      } catch (err) {
        if (err instanceof QueryFailedError) {
          logger.error('Query failed: %o', err.message)
          return res.status(500).send({ error: err.message })
        }
      }
    }
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const merchant = merchantRepository.create()
  merchant.dba_trading_name = req.body.dba_trading_name
  merchant.registered_name = req.body.registered_name // TODO: check if already registered
  merchant.employees_num = req.body.employees_num
  merchant.monthly_turnover = req.body.monthly_turnover
  merchant.currency_code = req.body.currency_code
  merchant.category_code = req.body.category_code
  merchant.registration_status = MerchantRegistrationStatus.DRAFT
  merchant.registration_status_reason = 'Drafted by Maker'
  merchant.allow_block_status = MerchantAllowBlockStatus.PENDING
  if (checkoutCounter !== null) {
    merchant.checkout_counters = [checkoutCounter]
  }
  // TODO: associat created_by with the current user (Maker)

  try {
    await merchantRepository.save(merchant)
  } catch (err) {
    if (err instanceof QueryFailedError) {
      logger.error('Query Failed: %o', err.message)
      return res.status(500).send({ error: err.message })
    }
    logger.error('Error: %o', err)
    return res.status(500).send({ error: err })
  }

  // PayInto Alias is set, then create checkout counter
  return res.status(200).send({ message: 'Drafting Merchant Successful', data: merchant })
})

/**
 * @openapi
 * /merchants/{id}/registration-status:
 *   put:
 *     tags:
 *       - Merchants
 *     summary: Update the registration status of Merchant Record
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
 *               registration_status:
 *                 type: string
 *                 description: The registration status of the merchant
 *                 example: "Approved"
 *     responses:
 *       200:
 *         description: GET Merchant by ID
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
// TODO: Protect the route with User Authentication (Keycloak)
router.put('/merchants/:id/registration-status', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      logger.error('Invalid ID')
      res.status(422).send({ message: 'Invalid ID' })
      return
    }

    // Validate the Request Body
    try {
      z.nativeEnum(MerchantRegistrationStatus).parse(req.body.registration_status)
    } catch (err) {
      if (err instanceof z.ZodError) {
        logger.error('Validation error: %o', err.issues.map((issue) => issue.message))
        return res.status(422).send({ error: err.issues.map((issue) => issue.message) })
      }
    }

    const merchantRepository = AppDataSource.getRepository(MerchantEntity)
    const merchant = await merchantRepository.findOne({ where: { id: Number(req.params.id) } })
    if (merchant == null) {
      return res.status(404).send({ message: 'Merchant not found' })
    }

    merchant.registration_status = req.body.registration_status
    merchant.registration_status_reason = req.body.registration_status_reason
    // TODO: associate checked_by with the current user (Checker)
    // merchant.checked_by = checker_user_id

    await merchantRepository.save(merchant)
    res.send({ message: 'Status Updated', data: merchant })
  } catch (e) {
    logger.error(e)
    res.status(500).send({ message: e })
  }
})

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
 *               distinct_name:
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
router.post('/merchants/:id/locations', async (req: Request, res: Response) => {
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

  const merchant = await merchantRepository.findOne(
    { where: { id } }
  )

  if (merchant == null) {
    logger.error('Merchant not found')
    return res.status(404).json({ error: 'Merchant not found' })
  }

  const newLocation = locationRepository.create({
    ...locationData,
    merchant
  })

  const savedLocation = await locationRepository.save(newLocation)

  return res.status(201).send({ message: 'Merchant Location Saved', data: savedLocation })
})

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
router.post('/merchants/:id/contact-persons', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    logger.error('Invalid ID')
    res.status(422).send({ message: 'Invalid ID' })
    return
  }

  const contactPersonData = req.body

  // Validate the Request Body
  try {
    ContactPersonSubmitDataSchema.parse(contactPersonData)
  } catch (err) {
    if (err instanceof z.ZodError) {
      logger.error('Contact Person Validation error: %o', err.issues.map(issue => issue.message))
      return res.status(422).send({ error: err.issues.map(issue => issue.message) })
    }
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const contactPersonRepository = AppDataSource.getRepository(ContactPersonEntity)

  const merchant = await merchantRepository.findOne(
    { where: { id } }
  )

  if (merchant == null) {
    logger.error('Merchant not found')
    return res.status(404).json({ error: 'Merchant not found' })
  }

  const newContactPerson = contactPersonRepository.create({
    ...contactPersonData,
    merchant
  })

  const savedContactPerson = await contactPersonRepository.save(newContactPerson)

  return res.status(201).send({
    message: 'Contact Person Saved',
    data: savedContactPerson
  })
})

/**
 * @openapi
 * /merchants/{id}/business-owners:
 *   post:
 *     tags:
 *       - Merchants
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
router.post('/merchants/:id/business-owners', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    logger.error('Invalid ID')
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
      return res.status(422).send({ error: err.issues.map(issue => issue.message) })
    }
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const businessOwnerRepository = AppDataSource.getRepository(BusinessOwnerEntity)

  const merchant = await merchantRepository.findOne(
    { where: { id } }
  )

  if (merchant == null) {
    logger.error('Merchant not found')
    return res.status(404).json({ error: 'Merchant not found' })
  }

  const newBusinessOwner = businessOwnerRepository.create({
    ...businessOwnerData,
    merchant
  })

  const savedBusinessOwner = await businessOwnerRepository.save(newBusinessOwner)

  return res.status(201).send({
    message: 'Business Owner Saved',
    data: savedBusinessOwner
  })
})
export default router
