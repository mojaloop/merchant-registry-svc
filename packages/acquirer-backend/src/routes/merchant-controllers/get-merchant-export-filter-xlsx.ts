/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import { merchantsToXlsxWorkbook } from '../../utils/merchantsToXlsxWorkbook'
import { PortalUserEntity } from '../../entity/PortalUserEntity'
import { CheckoutCounterEntity } from '../../entity/CheckoutCounterEntity'
import { isValidDate } from '../../utils/utils'
import { type MerchantRegistrationStatus } from 'shared-lib'
import { type AuthRequest } from 'src/types/express'

/**
 * @openapi
 * /merchants/export-with-filter:
 *   get:
 *     tags:
 *       - Merchants
 *       - Exports / Imports
 *     security:
 *       - Authorization: []
 *     summary: Export Merchants as XLSX
 *     parameters:
 *       - in: query
 *         name: merchantId
 *         schema:
 *           type: integer
 *         description: The ID of the merchant
 *       - in: query
 *         name: dbaName
 *         schema:
 *           type: string
 *         description: The trading name of the merchant
 *       - in: query
 *         name: registrationStatus
 *         schema:
 *           type: string
 *           enum: [Draft, Review, Waiting For Alias Generation, Approved, Rejected, Reverted]
 *         description: The registration status of the merchant
 *       - in: query
 *         name: payintoId
 *         schema:
 *           type: string
 *         description: The ID of the payment recipient for the merchant
 *       - in: query
 *         name: addedBy
 *         schema:
 *           type: integer
 *         description: The ID of the user who added the merchant
 *       - in: query
 *         name: approvedBy
 *         schema:
 *           type: integer
 *         description: The ID of the user who approved the merchant
 *       - in: query
 *         name: addedTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The time the merchant was added
 *       - in: query
 *         name: updatedTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The last time the merchant was updated
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

export async function exportMerchantFilterXlsx (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const {
    addedBy,
    approvedBy,
    addedTime,
    updatedTime,
    dbaName,
    merchantId,
    payintoId,
    registrationStatus
  } = req.query

  logger.debug('req.query: %o', req.query)

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const portalUserRepository = AppDataSource.getRepository(PortalUserEntity)
  const checkoutCounterRepository = AppDataSource.getRepository(CheckoutCounterEntity)

  const whereClause: Partial<MerchantEntity> = {}

  if (!isNaN(Number(addedBy)) && Number(addedBy) > 0) {
    const user = await portalUserRepository.findOne({ where: { id: Number(addedBy) } })
    if (user != null) whereClause.created_by = user
  }

  if (!isNaN(Number(approvedBy)) && Number(approvedBy) > 0) {
    const user = await portalUserRepository.findOne({ where: { id: Number(approvedBy) } })
    if (user != null) whereClause.checked_by = user
  }

  if (!isNaN(Number(merchantId)) && Number(merchantId) > 0) {
    whereClause.id = Number(merchantId)
  }

  if (typeof payintoId === 'string' && payintoId.length > 0) {
    const checkoutCounter = await checkoutCounterRepository.findOne({
      where: { alias_value: payintoId },
      relations: ['merchant']
    })
    if (checkoutCounter != null) {
      whereClause.id = checkoutCounter.merchant.id
    }
  }

  if (typeof registrationStatus === 'string' && registrationStatus.length > 0) {
    whereClause.registration_status = registrationStatus as MerchantRegistrationStatus
  }

  // Need to use query builder to do a LIKE query
  const queryBuilder = merchantRepository.createQueryBuilder('merchant')
  queryBuilder
    .leftJoinAndSelect('merchant.locations', 'locations')
    .leftJoinAndSelect('merchant.category_code', 'category_code')
    .leftJoinAndSelect('merchant.currency_code', 'currency_code')
    .leftJoinAndSelect('merchant.checkout_counters', 'checkout_counters')
    .leftJoinAndSelect('checkout_counters.checkout_location', 'checkout_location')
    .leftJoinAndSelect('merchant.dfsps', 'dfsps')
    .leftJoinAndSelect('merchant.business_licenses', 'business_licenses')
    .leftJoinAndSelect('merchant.contact_persons', 'contact_persons')
    .leftJoinAndSelect('merchant.created_by', 'created_by')
    .leftJoinAndSelect('merchant.business_owners', 'business_owners')
    .leftJoinAndSelect('business_owners.businessPersonLocation', 'businessPersonLocation')
    .leftJoinAndSelect('merchant.checked_by', 'checked_by')
    .where(whereClause)
    .orderBy('merchant.created_at', 'DESC') // Sort by latest

  logger.debug('WhereClause: %o', whereClause)
  // queryBuilder.where(whereClause)

  if (typeof dbaName === 'string' && dbaName.length > 0) {
    queryBuilder.andWhere('merchant.dba_trading_name LIKE :name', { name: `%${dbaName}%` })
  }

  if (typeof addedTime === 'string' && addedTime.length > 0) {
    const startOfDay = new Date(addedTime)
    if (isValidDate(startOfDay)) {
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(addedTime)
      endOfDay.setHours(23, 59, 59, 999)

      queryBuilder.andWhere(
        'merchant.created_at BETWEEN :start AND :end',
        { start: startOfDay, end: endOfDay }
      )
    }
  }

  if (typeof updatedTime === 'string' && updatedTime.length > 0) {
    const startOfDay = new Date(updatedTime)
    if (isValidDate(startOfDay)) {
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(updatedTime)
      endOfDay.setHours(23, 59, 59, 999)

      queryBuilder.andWhere(
        'merchant.updated_at BETWEEN :start AND :end',
        { start: startOfDay, end: endOfDay }
      )
    }
  }

  let merchants = await queryBuilder.getMany()

  // Now filter based on dfsps
  merchants = merchants.filter(merchant =>
    merchant.dfsps
      .map(dfsp => dfsp.id)
      .includes(portalUser.dfsp.id)
  )

  const workbook = await merchantsToXlsxWorkbook(merchants)

  const buffer = await workbook.xlsx.writeBuffer()

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename=merchants.xlsx')
  res.end(buffer)
}
