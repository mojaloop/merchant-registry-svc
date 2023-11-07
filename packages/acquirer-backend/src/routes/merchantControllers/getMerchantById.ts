/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { getMerchantDocumentURL, getQRImageUrl } from '../../services/S3Client'
import { AppDataSource } from '../../database/dataSource'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { type AuthRequest } from 'src/types/express'

/**
 * @openapi
 * /merchants/{id}:
 *   get:
 *     tags:
 *       - Merchants
 *     security:
 *       - Authorization: []
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
export async function getMerchantById (req: AuthRequest, res: Response) {
  const portalUser = req.user
  /* istanbul ignore if */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const id = Number(req.params.id)
    if (isNaN(id) || id < 1) {
      logger.error('Invalid ID')
      await audit(
        AuditActionType.ACCESS,
        AuditTrasactionStatus.FAILURE,
        'getMerchantById',
        `Invalid ID: ${req.params.id}`,
        'Merchants',
        {}, {}, portalUser
      )
      res.status(422).send({ message: 'Invalid ID' })
      return
    }
    const merchantRepository = AppDataSource.getRepository(MerchantEntity)
    let merchant: MerchantEntity | null
    try {
      merchant = await merchantRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: [
          'locations',
          'category_code',
          'currency_code',
          'checkout_counters',
          'business_licenses',
          'contact_persons',
          'created_by',
          'business_owners',
          'business_owners.businessPersonLocation',
          'checked_by',
          'dfsps',
          'default_dfsp'
        ]
      })

      if (merchant == null) {
        logger.error('Merchant not found')
        await audit(
          AuditActionType.ACCESS,
          AuditTrasactionStatus.FAILURE,
          'getMerchantById',
        `User ${portalUser.id} (${portalUser.email}) failed to fetch merchant ${req.params.id}`,
        'MerchantEntity',
        {}, {}, portalUser
        )
        return res.status(404).send({ message: 'Merchant not found' })
      }

      const validMerchantForUser = merchant.dfsps
        .map(dfsp => dfsp.id)
        .includes(portalUser.dfsp.id)
      if (!validMerchantForUser) {
        logger.error('Accessing different DFSP\'s Merchant is not allowed.')
        await audit(
          AuditActionType.ACCESS,
          AuditTrasactionStatus.FAILURE,
          'getMerchantById',
          `User ${portalUser.id} (${portalUser.email}) 
trying to access unauthorized(different DFSP) merchant ${merchant.id}`,
          'MerchantEntity',
          {}, {}, portalUser
        )
        return res.status(400).send({
          message: 'Accessing different DFSP\'s Merchant is not allowed.'
        })
      }
    } catch (e) /* istanbul ignore next */ {
      logger.error('Error fetching merchant: %o', e)
      await audit(
        AuditActionType.ACCESS,
        AuditTrasactionStatus.FAILURE,
        'getMerchantById',
        `User ${portalUser.id} (${portalUser.email}) failed to fetch merchant ${req.params.id}`,
        'MerchantEntity',
        {}, {}, portalUser
      )
      res.status(500).send({ message: e })
      return
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

    for (let i = 0; i < merchant.business_licenses?.length; i++) {
      const licenseDocumentLink = merchant.business_licenses[i].license_document_link
      if (licenseDocumentLink !== null &&
            licenseDocumentLink !== ''
      ) {
        merchant.business_licenses[i].license_document_link =
          await getMerchantDocumentURL(licenseDocumentLink)
      }
    }

    for (let i = 0; i < merchant.checkout_counters?.length; i++) {
      const qrCodeLink = merchant.checkout_counters[i].qr_code_link
      if (qrCodeLink !== null) {
        merchant.checkout_counters[i].qr_code_link = await getQRImageUrl(qrCodeLink)
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

    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.SUCCESS,
      'getMerchantById',
      `User ${portalUser.id} (${portalUser.email}) fetched merchant ${merchant.id}`,
      'MerchantEntity',
      {}, {}, portalUser
    )
    return res.send({ message: 'OK', data: merchantData })
  } catch (e) {
    logger.error(e)
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getMerchantById',
      `User ${portalUser.id} (${portalUser.email}) failed to fetch merchant ${req.params.id}`,
      'MerchantEntity',
      {}, {}, portalUser
    )
    return res.status(500).send({ message: e })
  }
}
