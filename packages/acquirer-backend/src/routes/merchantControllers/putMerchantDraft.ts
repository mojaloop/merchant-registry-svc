/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { QueryFailedError } from 'typeorm'
import * as z from 'zod'
import { AppDataSource } from '../../database/dataSource'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import { BusinessLicenseEntity } from '../../entity/BusinessLicenseEntity'
import {
  MerchantAllowBlockStatus,
  MerchantRegistrationStatus
  , AuditActionType, AuditTrasactionStatus
} from 'shared-lib'

import {
  MerchantSubmitDataSchema
} from '../schemas'
import { uploadMerchantDocument } from '../../services/S3Client'

import { audit } from '../../utils/audit'
import { type AuthRequest } from 'src/types/express'
/**
 * @openapi
 * /merchants/{id}/draft:
 *   put:
 *     tags:
 *       - Merchants
 *     security:
 *       - Authorization: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *        required: true
 *        description: Numeric ID of the Merchant Record
 *     summary: Update Merchant Draft
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
 *               license_number:
 *                 type: string
 *                 example: "123456789"
 *                 required: true
 *
 *               license_document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description:
 *          Updating Merchant Draft Successful
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Updating Merchant Draft Successful"
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
export async function putMerchantDraft (req: AuthRequest, res: Response) {
  const portalUser = req.user

  /* istanbul ignore if */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    logger.debug('Validating request body: %o', req.body)
    MerchantSubmitDataSchema.parse(req.body)
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.issues.map(issue => `${issue.path.toString()}: ${issue.message}`)
      logger.error('Validation error: %o', errors)
      await audit(
        AuditActionType.ADD,
        AuditTrasactionStatus.FAILURE,
        'putMerchantDraft',
        'Validation error',
        'MerchantEntity',
        {}, req.body, portalUser
      )

      return res.status(422).send({ message: errors })
    }
  }

  // Merchant ID validation
  const id = Number(req.params.id)
  if (isNaN(id)) {
    logger.error('Invalid ID')
    res.status(422).send({ message: 'Invalid ID' })
    return
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const merchant = await merchantRepository.findOne({
    where: { id },
    relations: ['business_licenses', 'dfsps']
  })

  if (merchant === null) {
    return res.status(422).send({ message: 'Merchant ID does not exist' })
  }

  const validMerchantForUser = merchant.dfsps
    .map(dfsp => dfsp.id)
    .includes(portalUser.dfsp.id)
  if (!validMerchantForUser) {
    logger.error('Accessing different DFSP\'s Merchant is not allowed.')
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'putMerchantDraft',
          `User ${portalUser.id} (${portalUser.email}) 
trying to access unauthorized(different DFSP) merchant ${merchant.id}`,
          'MerchantEntity',
          {}, {}, portalUser
    )
    return res.status(400).send({
      message: 'Accessing different DFSP\'s Merchant is not allowed.'
    })
  }

  if (merchant.registration_status !== MerchantRegistrationStatus.DRAFT &&
    merchant.registration_status !== MerchantRegistrationStatus.REVERTED) {
    return res.status(422).send({
      message: `Merchant is not in Draft Status. Current Status: ${merchant.registration_status}`
    })
  }

  logger.debug('Updating Merchant: %o', merchant.id)
  const oldMerchant = { ...merchant } // Clone the merchant object for audit logging
  oldMerchant.business_licenses = []

  merchant.dba_trading_name = req.body.dba_trading_name
  merchant.registered_name = req.body.registered_name // TODO: check if already registered
  merchant.employees_num = req.body.employees_num
  merchant.monthly_turnover = req.body.monthly_turnover
  merchant.currency_code = req.body.currency_code
  merchant.category_code = req.body.category_code
  merchant.merchant_type = req.body.merchant_type
  merchant.registration_status = MerchantRegistrationStatus.DRAFT
  merchant.allow_block_status = MerchantAllowBlockStatus.PENDING

  if (portalUser !== null) { // Should never be null.. but just in case
    merchant.created_by = portalUser
  }
  try {
    await merchantRepository.save(merchant)

    // Update License Data
    const file = req.file
    const licenseNumber = req.body.license_number
    const licenseRepository = AppDataSource.getRepository(BusinessLicenseEntity)
    let license: BusinessLicenseEntity | null = merchant.business_licenses[0] ?? null

    if (license === null) {
      license = new BusinessLicenseEntity()
    }

    license.license_number = licenseNumber
    license.merchant = merchant

    if (file != null) {
      const documentPath = await uploadMerchantDocument(merchant, licenseNumber, file)
      if (documentPath == null) {
        logger.error('Failed to upload the PDF to Storage Server')
      } else {
        logger.debug('Successfully uploaded the PDF \'%s\' to Storage', documentPath)
        // Save the file info to the database
        license.license_document_link = documentPath
        await licenseRepository.save(license)
        merchant.business_licenses = [license]
        await merchantRepository.save(merchant)
      }
    } else {
      logger.debug('No PDF file submitted for the merchant')
    }
  } catch (err)/* istanbul ignore next */ {
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

  await audit(
    AuditActionType.UPDATE,
    AuditTrasactionStatus.SUCCESS,
    'putMerchantDraft',
    'Updating Merchant Draft Successful',
    'MerchantEntity',
    oldMerchant, { ...merchantData, business_licenses: [] }, portalUser
  )
  return res.status(200).send({ message: 'Updating Merchant Draft Successful', data: merchantData })
}
