/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Request, type Response } from 'express'
import { QueryFailedError } from 'typeorm'
import * as z from 'zod'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import { MerchantLocationEntity } from '../../entity/MerchantLocationEntity'
import logger from '../../logger'
import { CheckoutCounterEntity } from '../../entity/CheckoutCounterEntity'
import { ContactPersonEntity } from '../../entity/ContactPersonEntity'
import { BusinessOwnerEntity } from '../../entity/BusinessOwnerEntity'
import { BusinessPersonLocationEntity } from '../../entity/BusinessPersonLocationEntity'
import { BusinessLicenseEntity } from '../../entity/BusinessLicenseEntity'
import { PortalUserEntity } from '../../entity/PortalUserEntity'
import {
  MerchantAllowBlockStatus,
  MerchantRegistrationStatus
} from 'shared-lib'

import {
  MerchantSubmitDataSchema,
  MerchantLocationSubmitDataSchema,
  ContactPersonSubmitDataSchema,
  BusinessOwnerSubmitDataSchema
} from '../schemas'
import { pdfUpload, uploadMerchantDocument } from '../../middleware/minioClient'

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
export async function postMerchantDraft (req: Request, res: Response) {
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
}
