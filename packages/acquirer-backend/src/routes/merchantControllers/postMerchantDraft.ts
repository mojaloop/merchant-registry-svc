/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { QueryFailedError } from 'typeorm'
import * as z from 'zod'
import { AppDataSource } from '../../database/dataSource'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import { BusinessLicenseEntity } from '../../entity/BusinessLicenseEntity'
import {
  MerchantAllowBlockStatus
  , AuditActionType, AuditTrasactionStatus, MerchantRegistrationStatus
} from 'shared-lib'

import {
  MerchantSubmitDataSchema
} from '../schemas'
import { uploadMerchantDocument } from '../../services/S3Client'
import { audit } from '../../utils/audit'
import { type AuthRequest } from 'src/types/express'
import { gleifService } from '../../services/GLEIFService'

/**
 * @openapi
 * /merchants/draft:
 *   post:
 *     tags:
 *       - Merchants
 *     security:
 *       - Authorization: []
 *     summary: Create a new Merchant Draft
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
 *               lei:
 *                 type: string
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
 *               license_number:
 *                 type: string
 *               license_document:
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
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "LEI validation failed: LEI not found in GLEIF database"
 *                field:
 *                  type: string
 *                  example: "lei"
 *       500:
 *         description: Server error
 */
export async function postMerchantDraft (req: AuthRequest, res: Response) {
  const portalUser = req.user

  /* istanbul ignore if */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  // Validate request body
  const validationError = await validateMerchantData(req.body, portalUser)
  if (validationError !== null && validationError !== undefined) {
    return res.status(422).send(validationError)
  }

  // Validate LEI if provided
  const leiValidationError = await validateLEIIfProvided(req.body, portalUser)
  if (leiValidationError !== null && leiValidationError !== undefined) {
    return res.status(422).send(leiValidationError)
  }

  // Create and populate merchant entity
  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const merchant = createMerchantEntity(merchantRepository, req.body, portalUser)

  // Save merchant and business license
  const saveError = await saveMerchantWithLicense(merchant, merchantRepository, req.file, req.body.license_number)
  if (saveError !== null && saveError !== undefined && saveError !== '') {
    return res.status(500).send({ message: saveError })
  }

  // Prepare and send response
  const merchantData = sanitizeMerchantResponse(merchant)
  return res.status(201).send({ message: 'Drafting Merchant Successful', data: merchantData })
}

/**
 * Validate merchant data against schema
 */
async function validateMerchantData (body: any, portalUser: any) {
  try {
    MerchantSubmitDataSchema.parse(body)
    return null
  } catch (err) {
    return await handleValidationError(err, body, portalUser)
  }
}

/**
 * Handle validation error
 */
async function handleValidationError (err: any, body: any, portalUser: any) {
  if (!(err instanceof z.ZodError)) {
    return null
  }

  const errors = err.issues.map(issue => `${issue.path.toString()}: ${issue.message}`)
  logger.error('Validation error: %o', errors)
  await audit(
    AuditActionType.ADD,
    AuditTrasactionStatus.FAILURE,
    'postMerchantDraft',
    'Validation error',
    'Merchant',
    {}, body, portalUser
  )
  return { message: errors }
}

/**
 * Check if LEI should be validated
 */
function shouldValidateLEI (lei: string): boolean {
  return lei !== null && lei !== undefined && lei !== ''
}

/**
 * Validate LEI if provided
 */
async function validateLEIIfProvided (body: any, portalUser: any) {
  if (!shouldValidateLEI(body.lei)) {
    logger.info('No LEI provided, skipping validation')
    return null
  }

  logger.info('Starting LEI validation for: %s', body.lei)
  return await performLEIValidation(body, portalUser)
}

/**
 * Perform actual LEI validation
 */
async function performLEIValidation (body: any, portalUser: any) {
  try {
    console.log(body.dba_trading_name)
    const leiValidation = await gleifService.validateLEI(body.lei, body.dba_trading_name ?? '')

    if (!leiValidation.isValid) {
      return await handleLEIValidationFailure(body.lei, leiValidation.error, portalUser)
    }

    logger.info('LEI validation successful for %s: %s', body.lei, leiValidation.entityName)
    return null
  } catch (error) {
    handleLEIValidationError(error)
    return null
  }
}

/**
 * Handle LEI validation failure
 */
async function handleLEIValidationFailure (lei: string, error: string | undefined, portalUser: any) {
  logger.error('LEI validation failed: %o', error)
  await audit(
    AuditActionType.ADD,
    AuditTrasactionStatus.FAILURE,
    'postMerchantDraft',
    'LEI validation failed',
    'Merchant',
    {}, { lei, error }, portalUser
  )
  return {
    message: `LEI validation failed: ${error}`,
    field: 'lei'
  }
}

/**
 * Handle LEI validation error
 */
function handleLEIValidationError (error: any) {
  logger.error('LEI validation error: %o', error)
  if (!gleifService.isConfigured()) {
    logger.warn('GLEIF service not configured, skipping LEI validation')
  }
}

/**
 * Create and populate merchant entity
 */
function createMerchantEntity (merchantRepository: any, body: any, portalUser: any): MerchantEntity {
  const merchant = merchantRepository.create()

  merchant.dba_trading_name = body.dba_trading_name
  merchant.registered_name = body.registered_name // TODO: check if already registered
  merchant.lei = body.lei
  merchant.employees_num = body.employees_num
  merchant.monthly_turnover = body.monthly_turnover
  merchant.currency_code = body.currency_code
  merchant.category_code = body.category_code
  merchant.merchant_type = body.merchant_type
  merchant.registration_status = MerchantRegistrationStatus.DRAFT
  merchant.registration_status_reason = `Draft Merchant by ${portalUser?.email}`
  merchant.allow_block_status = MerchantAllowBlockStatus.PENDING
  merchant.dfsps = [portalUser.dfsp]
  merchant.default_dfsp = portalUser.dfsp
  merchant.gleif_verified_at = new Date()

  if (portalUser !== null) {
    merchant.created_by = portalUser
  }

  return merchant
}

/**
 * Save merchant and associated business license
 */
async function saveMerchantWithLicense (
  merchant: MerchantEntity,
  merchantRepository: any,
  file: any,
  licenseNumber: string
): Promise<string | null> {
  try {
    await merchantRepository.save(merchant)

    const licenseRepository = AppDataSource.getRepository(BusinessLicenseEntity)
    const license = new BusinessLicenseEntity()
    const documentPath = await uploadLicenseDocument(merchant, file, licenseNumber ?? '')

    license.license_number = licenseNumber ?? ''
    license.license_document_link = documentPath ?? ''
    license.merchant = merchant
    await licenseRepository.save(license)

    merchant.business_licenses = [license]
    await merchantRepository.save(merchant)
    return null
  } catch (err) {
    return formatSaveError(err)
  }
}

/**
 * Format save error message
 */
function formatSaveError (err: any): string {
  if (err instanceof QueryFailedError) {
    logger.error('Query Failed: %o', err.message)
    return err.message
  }
  logger.error('Error: %o', err)
  return err.toString()
}

/**
 * Upload license document if provided
 */
async function uploadLicenseDocument (
  merchant: MerchantEntity,
  file: any,
  licenseNumber: string
): Promise<string | null> {
  if (file == null) {
    logger.debug('No file uploaded')
    return null
  }

  const documentPath = await uploadMerchantDocument(merchant, licenseNumber, file)
  if (documentPath == null) {
    logger.error('Failed to upload the PDF to Storage Server')
  } else {
    logger.debug('Successfully uploaded the PDF \'%s\' to Storage', documentPath)
  }
  return documentPath
}

/**
 * Sanitize merchant response data
 */
function sanitizeMerchantResponse (merchant: MerchantEntity) {
  return {
    ...merchant,
    created_by: undefined,
    business_licenses: merchant.business_licenses?.map(license => {
      const { merchant, ...licenseData } = license
      return licenseData
    })
  }
}
