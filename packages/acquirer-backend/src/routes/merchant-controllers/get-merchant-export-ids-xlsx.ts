/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { In } from 'typeorm'
import { merchantsToXlsxWorkbook } from '../../utils/merchantsToXlsxWorkbook'
import { type AuthRequest } from 'src/types/express'

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
 *         description: IDs are either as a comma-separated string or an array of numbers.
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

export async function exportMerchantIdsXlsx (req: AuthRequest, res: Response) {
  const portalUser = req.user
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
      'exportMerchantIdsXlsx',
        `User ${portalUser.id} (${portalUser.email}) failed to fetch merchant ${ids.join(', ')}`,
        'MerchantEntity',
        {}, {}, portalUser
    )
    res.status(500).send({ message: e })
  }

  // check if merchant is in the same dfsp if not return 400
  for (const merchant of merchants) {
    const validMerchantForUser = merchant.dfsps
      .map(dfsp => dfsp.id)
      .includes(portalUser.dfsp.id)
    if (!validMerchantForUser) {
      logger.error('Accessing different DFSP\'s Merchant is not allowed.')
      await audit(
        AuditActionType.ACCESS,
        AuditTrasactionStatus.FAILURE,
        'exportMerchantIdsXlsx',
        `User ${portalUser.id} (${portalUser.email}) 
trying to access unauthorized(different DFSP) merchant ${merchant.id}`,
        'MerchantEntity',
        {}, {}, portalUser
      )
      return res.status(400).send({
        message: 'Accessing different DFSP\'s Merchant is not allowed.'
      })
    }
  }

  // merchants = merchants.filter(merchant =>
  //   merchant.dfsps.includes(portalUser.dfsp)
  // )

  const workbook = await merchantsToXlsxWorkbook(merchants)

  const buffer = await workbook.xlsx.writeBuffer()

  await audit(
    AuditActionType.ACCESS,
    AuditTrasactionStatus.SUCCESS,
    'exportMerchantIdsXlsx',
    `User ${portalUser.id} (${portalUser.email}) exported ${merchants.length} merchants`,
    'MerchantEntity',
    {}, { merchant_ids: merchants.map(m => m.id) }, portalUser
  )

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename=merchants.xlsx')
  res.end(buffer)
}
