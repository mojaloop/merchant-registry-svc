/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Request, type Response } from 'express'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../logger'
import { getAuthenticatedPortalUser } from '../../middleware/authenticate'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { In } from 'typeorm'
import { merchantsToXlsxWorkbook } from '../../utils/merchantsToXlsxWorkbook'

/**
 * @openapi
 * /merchants/export-with-ids:
 *   get:
 *     tags:
 *       - Merchants
 *       - Exports / Imports
 *     security:
 *       - Authorization: []
 *     summary: Export Merchants as XLSX
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: number
 *         description: Merchant Record IDs are either as a comma-separated string or an array of numbers.
 *         example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Merchants Exported
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

export async function exportMerchantIdsXlsx (req: Request, res: Response) {
  const portalUser = await getAuthenticatedPortalUser(req.headers.authorization)
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  logger.debug('req.query.ids: %o', req.query.ids)
  const idsParam = req.query.ids
  let ids: number[] = []

  if (typeof idsParam === 'string') {
    ids = idsParam.split(',').map(Number)
  } else if (Array.isArray(idsParam)) {
    ids = idsParam.map(Number)
  } else {
    throw new Error('IDs must be provided as a comma-separated string or an array of numbers.')
  }

  // Validate IDs
  if (!Array.isArray(ids)) throw new Error('IDs must be an array of numbers.')
  for (const id of ids) {
    if (isNaN(Number(id)) || Number(id) < 1) {
      await audit(
        AuditActionType.UPDATE,
        AuditTrasactionStatus.FAILURE,
        'putBulkApprove',
        'ID must be a valid ID number',
        'Merchant',
        {}, {}, portalUser
      )

      return res.status(422).send({ message: 'Each ID in the array must be a valid ID number.' })
    }
  }

  let merchants: MerchantEntity[] = []
  try {
    merchants = await merchantRepository.find({
      where: {
        id: In(ids)
      },
      relations: [
        'locations',
        'category_code',
        'currency_code',
        'checkout_counters',
        'checkout_counters.checkout_location',
        'business_licenses',
        'contact_persons',
        'created_by',
        'business_owners',
        'business_owners.businessPersonLocation',
        'checked_by'
      ],
      order: {
        created_at: 'DESC' // Sorting by the created_at field in descending order
      }
    })
  } catch (e) {
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
  }

  const workbook = await merchantsToXlsxWorkbook(merchants)

  const buffer = await workbook.xlsx.writeBuffer()

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename=merchants.xlsx')
  res.end(buffer)
}
