/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Request, type Response } from 'express'
import { getMerchantDocumentURL } from '../../middleware/minioClient'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../logger'
import { getAuthenticatedPortalUser } from '../../middleware/authenticate'

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
// TODO: Protect the route
export async function getMerhcantById (req: Request, res: Response) {
  const portalUser = await getAuthenticatedPortalUser(req.headers.authorization)
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      logger.error('Invalid ID')
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
          'checked_by'
        ]
      })
    } catch (e) {
      logger.error('Error fetching merchant: %o', e)
      res.status(500).send({ message: e })
      return
    }

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

    if (merchant.business_licenses?.length > 0) {
      for (let i = 0; i < merchant.business_licenses.length; i++) {
        if (merchant.business_licenses[i].license_document_link !== null &&
            merchant.business_licenses[i].license_document_link !== undefined &&
            merchant.business_licenses[i].license_document_link !== ''
        ) {
          merchant.business_licenses[i].license_document_link =
            await getMerchantDocumentURL(merchant.business_licenses[i].license_document_link)
        }
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
}
