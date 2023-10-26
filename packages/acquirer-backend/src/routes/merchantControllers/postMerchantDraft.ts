/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { QueryFailedError } from 'typeorm'
import * as z from 'zod'
import { AppDataSource } from '../../database/dataSource'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import { CheckoutCounterEntity } from '../../entity/CheckoutCounterEntity'
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
 *                 example: "123456789"
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
 *       500:
 *         description: Server error
 */
export async function postMerchantDraft (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    MerchantSubmitDataSchema.parse(req.body)
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.issues.map(issue => `${issue.path.toString()}: ${issue.message}`)
      logger.error('Validation error: %o', errors)
      await audit(
        AuditActionType.ADD,
        AuditTrasactionStatus.FAILURE,
        'postMerchantDraft',
        'Validation error',
        'Merchant',
        {}, req.body, portalUser
      )

      return res.status(422).send({ message: errors })
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
  merchant.merchant_type = req.body.merchant_type
  merchant.registration_status = MerchantRegistrationStatus.DRAFT
  merchant.registration_status_reason = `Draft Merchant by ${portalUser?.email}`
  merchant.allow_block_status = MerchantAllowBlockStatus.PENDING
  merchant.dfsps = [portalUser.dfsp]
  merchant.default_dfsp = portalUser.dfsp

  if (portalUser !== null) { // Should never be null.. but just in case
    merchant.created_by = portalUser
  }

  try {
    await merchantRepository.save(merchant)

    // Upload Business License Document
    const licenseRepository = AppDataSource.getRepository(BusinessLicenseEntity)
    const file = req.file
    const licenseNumber = req.body.license_number
    const license = new BusinessLicenseEntity()
    let documentPath = null

    if (file != null) {
      documentPath = await uploadMerchantDocument(merchant, licenseNumber, file)
      if (documentPath == null) {
        logger.error('Failed to upload the PDF to Storage Server')
      } else {
        logger.debug('Successfully uploaded the PDF \'%s\' to Storage', documentPath)
      }
    } else {
      logger.debug('No file uploaded')
    }
    // Save the license info to the database
    license.license_number = licenseNumber
    license.license_document_link = documentPath ?? ''
    license.merchant = merchant
    await licenseRepository.save(license)
    merchant.business_licenses = [license]
    await merchantRepository.save(merchant)
  } catch (err) {
    if (err instanceof QueryFailedError) {
      logger.error('Query Failed: %o', err.message)
      return res.status(500).send({ message: err.message })
    }
    logger.error('Error: %o', err)
    return res.status(500).send({ message: err })
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
