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
import { BusinessPersonLocationEntity } from '../entity/BusinessPersonLocationEntity'
import { BusinessLicenseEntity } from '../entity/BusinessLicenseEntity'
import { PortalUserEntity } from '../entity/PortalUserEntity'
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
import { pdfUpload, uploadMerchantDocument } from '../middleware/minioClient'

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
        'contact_persons',
        'created_by',
        'business_owners',
        'checked_by'
      ]
    })
    if (merchant == null) {
      return res.status(404).send({ message: 'Merchant not found' })
    }
    // Create a new object that excludes the created_by's hasheded password field
    let checkedBy = null
    if (merchant.checked_by !== null && merchant.checked_by !== undefined) {
      checkedBy = {
        id: merchant.checked_by.id,
        name: merchant.checked_by.name,
        email: merchant.checked_by.email,
        phone_number: merchant.checked_by.phone_number
      }
    }

    const merchantData = {
      ...merchant,
      created_by: {
        id: merchant.created_by.id,
        name: merchant.created_by.name,
        email: merchant.created_by.email,
        phone_number: merchant.created_by.phone_number
      },
      checked_by: checkedBy
    }

    res.send({ message: 'OK', data: merchantData })
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
 *     security:
 *       - Authorization: []
 *     summary: Create a new Merchant Draft or Submit for Approval
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               dba_trading_name:
 *                 type: string
 *                 example: "Merchant 1"
 *               registered_name:
 *                 type: string
 *                 example: "Merchant 1"
 *               employees_num:
 *                 type: string
 *                 example: "1 - 5"
 *               monthly_turnover:
 *                 type: number
 *                 example: 0.5
 *               currency_code:
 *                 type: string
 *                 example: "PHP"
 *               category_code:
 *                 type: string
 *                 example: "10410"
 *               merchant_type:
 *                 type: string
 *                 example: "Individual"
 *               payinto_alias:
 *                 type: string
 *                 example: "merchant1"
 *                 required: false
 *               registration_status:
 *                 type: string
 *                 example: "Draft"
 *               registration_status_reason:
 *                 type: string
 *                 example: "Drafted by Maker"
 *               license_number:
 *                 type: string
 *                 example: "123456789"
 *                 required: true
 *
 *               file:
 *                 type: string
 *                 format: binary
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
router.post('/merchants/draft',
  pdfUpload.single('licenseDocument'),
  async (req: Request, res: Response) => {
  // TODO: Remove This! and replace with Keycloak Authentication
    const token = req.headers.authorization === undefined
      ? undefined
      : req.headers.authorization.replace('Bearer', '').trim()
    logger.info('Token: %s', token)
    let portalUser = null
    if (token === process.env.TEST1_DUMMY_AUTH_TOKEN) {
      portalUser = await AppDataSource.manager.findOne(
        PortalUserEntity,
        { where: { email: process.env.TEST1_EMAIL } }
      )
    } else if (token === process.env.TEST2_DUMMY_AUTH_TOKEN) {
      portalUser = await AppDataSource.manager.findOne(
        PortalUserEntity,
        { where: { email: process.env.TEST2_EMAIL } }
      )
    } else {
      return res.status(401).send({ message: 'Unauthorized' })
    }

    try {
      MerchantSubmitDataSchema.parse(req.body)
    } catch (err) {
      if (err instanceof z.ZodError) {
        logger.error('Validation error: %o', err.issues.map((issue) => issue.message))
        return res.status(422).send({ error: err })
      }
    }

    const merchantRepository = AppDataSource.getRepository(MerchantEntity)
    let merchant = merchantRepository.create()
    if (req.body.id !== undefined && req.body.id !== null && req.body.id !== '') {
      const m = await merchantRepository.findOne({
        where: {
          id: req.body.id,
          registration_status: MerchantRegistrationStatus.DRAFT
        }
      })

      if (m === null) {
        return res.status(422).send({ error: 'Updating Merchant ID does not exist' })
      }
      merchant = m
      logger.info('Updating Merchant: %o', merchant.id)
    }

    const alias: string = req.body.payinto_alias
    // TODO: Talk to Merchant Registry Oracle Service to create merchant_registry_id ?
    let checkoutCounter = null
    if (merchant?.checkout_counters?.length === 1) {
    // Just use the existing checkout counter
      checkoutCounter = merchant.checkout_counters[0]
      logger.debug('Using existing checkout counter: %o', checkoutCounter.id)
    } else {
    // Check if alias already exists, if it does, return error
    // if alias not exists, create new checkout counter with new alias
      const isExists = await AppDataSource.manager.exists(
        CheckoutCounterEntity,
        { where: { alias_value: alias } }
      )
      if (isExists) {
        const errorMsg = `PayInto Alias Value already exists: ${alias} `
        logger.error(errorMsg)
        return res.status(422).send({ error: errorMsg })
      }
      if (checkoutCounter === null) {
        checkoutCounter = new CheckoutCounterEntity()
        logger.debug('Creating new checkout counter: %o', checkoutCounter)
      }
    }

    // Update PayInto Alias Value
    checkoutCounter.alias_value = alias

    try {
      await AppDataSource.manager.save(checkoutCounter)
    } catch (err) {
      if (err instanceof QueryFailedError) {
        logger.error('Query failed: %o', err.message)
        return res.status(500).send({ error: err.message })
      }
    }

    merchant.dba_trading_name = req.body.dba_trading_name
    merchant.registered_name = req.body.registered_name // TODO: check if already registered
    merchant.employees_num = req.body.employees_num
    merchant.monthly_turnover = req.body.monthly_turnover
    merchant.currency_code = req.body.currency_code
    merchant.category_code = req.body.category_code
    merchant.merchant_type = req.body.merchant_type
    merchant.registration_status = req.body.registration_status
    merchant.registration_status_reason = req.body.registration_status_reason
    merchant.allow_block_status = MerchantAllowBlockStatus.PENDING

    if (portalUser !== null) { // Should never be null.. but just in case
      merchant.created_by = portalUser
    }
    if (checkoutCounter !== null) {
      merchant.checkout_counters = [checkoutCounter]
    }

    // TODO: associat created_by with the current user (Maker)

    try {
      await merchantRepository.save(merchant)

      // Upload Business License Document
      const file = req.file
      if (file != null) {
        const licenseRepository = AppDataSource.getRepository(BusinessLicenseEntity)

        const documentPath = await uploadMerchantDocument(merchant, file)
        if (documentPath == null) {
          logger.error('Failed to upload the PDF to Storage Server')
        } else {
          logger.debug('Successfully uploaded the PDF \'%s\' to Storage', documentPath)
          // Save the file info to the database
          const license = new BusinessLicenseEntity()
          license.license_number = req.body.license_number
          license.license_document_link = documentPath
          license.merchant = merchant
          await licenseRepository.save(license)
          merchant.business_licenses = [license]
          await merchantRepository.save(merchant)
        }
      } else {
        logger.debug('No PDF file submitted for the merchant')
      }
    } catch (err) {
    // Revert the checkout counter creation
      if (checkoutCounter !== null) {
        await AppDataSource.manager.delete(CheckoutCounterEntity, checkoutCounter.id)
      }

      if (err instanceof QueryFailedError) {
        logger.error('Query Failed: %o', err.message)
        return res.status(500).send({ error: err.message })
      }
      logger.error('Error: %o', err)
      return res.status(500).send({ error: err })
    }

    // Remove created_by from the response to prevent password hash leaking
    const merchantData = {
      ...merchant,
      created_by: undefined,

      // Fix TypeError: Converting circular structure to JSON
      business_licenses: merchant.business_licenses?.map(license => {
        const { merchant, ...licenseData } = license
        return licenseData
      })
    }
    return res.status(201).send({ message: 'Drafting Merchant Successful', data: merchantData })
  })

/**
 * @openapi
 * /merchants/{id}/registration-status:
 *   put:
 *     tags:
 *       - Merchants
 *     security:
 *       - Authorization: []
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
 *         description: Status Updated
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
  // TODO: Remove This! and replace with Keycloak Authentication
  const token = req.headers.authorization === undefined
    ? undefined
    : req.headers.authorization.replace('Bearer', '').trim()
  logger.info('Token: %s', token)
  let portalUser = null
  if (token === process.env.TEST1_DUMMY_AUTH_TOKEN) {
    logger.info('TEST1_DUMMY_AUTH_TOKEN')
    portalUser = await AppDataSource.manager.findOne(
      PortalUserEntity,
      { where: { email: process.env.TEST1_EMAIL } }
    )
  } else if (token === process.env.TEST2_DUMMY_AUTH_TOKEN) {
    logger.info('TEST2_DUMMY_AUTH_TOKEN')
    portalUser = await AppDataSource.manager.findOne(
      PortalUserEntity,
      { where: { email: process.env.TEST2_EMAIL } }
    )
  } else {
    return res.status(401).send({ message: 'Unauthorized' })
  }

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
    const merchant = await merchantRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: [
        'created_by'
      ]
    })
    if (merchant == null) {
      return res.status(404).send({ message: 'Merchant not found' })
    }

    if (portalUser == null || merchant.created_by.id === portalUser.id) {
      return res.status(401).send({
        message: 'Same Hub User cannot do both Sumitting and Review Checking'
      })
    }

    merchant.registration_status = req.body.registration_status
    merchant.registration_status_reason = req.body.registration_status_reason
    merchant.checked_by = portalUser
    // TODO: associate checked_by with the current user (Checker)
    // merchant.checked_by = checker_user_id

    try {
      await merchantRepository.save(merchant)
    } catch (err) {
      if (err instanceof QueryFailedError) {
        logger.error('Query Failed: %o', err.message)
        return res.status(500).send({ error: err.message })
      }
    }

    // Remove created_by from the response to prevent password hash leaking
    const merchantData = {
      ...merchant,
      created_by: undefined,
      checked_by: undefined
    }
    res.status(200).send({ message: 'Status Updated', data: merchantData })
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

  const checkoutDescription: string = req.body.checkout_description
  if (checkoutDescription !== null && checkoutDescription !== '') {
    if (merchant.checkout_counters.length > 0) {
      merchant.checkout_counters[0].description = req.body.checkout_description

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
router.post('/merchants/:id/contact-persons', async (req: Request, res: Response) => {
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
router.post('/merchants/:id/business-owners', async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (isNaN(id) || id <= 0) {
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
  const locationRepository = AppDataSource.getRepository(BusinessPersonLocationEntity)

  const merchant = await merchantRepository.findOne(
    {
      where: { id },
      relations: ['business_owners']
    }
  )

  if (merchant == null) {
    logger.error('Merchant not found')
    return res.status(404).json({ error: 'Merchant not found' })
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
    return res.status(500).send({ error: 'error creating business owner location' })
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
    return res.status(500).send({ error: 'error creating business owner' })
  }

  if (merchant.business_owners == null || merchant.business_owners.length === 0) {
    merchant.business_owners = [businessOwner]
  } else {
    merchant.business_owners.push(businessOwner)
  }
  await merchantRepository.save(merchant)

  return res.status(201).send({
    message: 'Business Owner Saved',
    data: businessOwner
  })
})
export default router
