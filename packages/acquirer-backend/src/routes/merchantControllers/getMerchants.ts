/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import { CheckoutCounterEntity } from '../../entity/CheckoutCounterEntity'
import { PortalUserEntity } from '../../entity/PortalUserEntity'
import { type MerchantRegistrationStatus } from 'shared-lib'

import { isValidDate } from '../../utils/utils'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { type AuthRequest } from '../../types/express'

/**
 * @openapi
 * tags:
 *   name: Merchants
 *
 * /merchants:
 *   get:
 *     tags:
 *       - Merchants
 *     security:
 *       - Authorization: []
 *     summary: GET Merchants List
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number
 *         minimum: 1
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The number of items per page
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
 */
export async function getMerchants (req: AuthRequest, res: Response) {
  const portalUser = req.user

  /* istanbul ignore if  */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  // Pagination parameters
  const { page = 1, limit = 10 } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  if (isNaN(skip) || isNaN(Number(limit)) || skip < 0 || Number(limit) < 1) {
    return res.status(400).send({ message: 'Invalid pagination parameters' })
  }

  try {
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

    const queryBuilder = merchantRepository.createQueryBuilder('merchant')
    queryBuilder
      .leftJoin('merchant.created_by', 'created_by')
      .leftJoin('merchant.checked_by', 'checked_by')
      .leftJoin('merchant.locations', 'locations')
      .leftJoin('merchant.checkout_counters', 'checkout_counters')
      .leftJoinAndSelect('merchant.dfsps', 'dfsps')
      .leftJoinAndSelect('merchant.default_dfsp', 'default_dfsp')
      .addSelect(['created_by.id', 'created_by.name'])
      .addSelect(['checked_by.id', 'checked_by.name'])
      .addSelect(['locations.country_subdivision', 'locations.town_name'])
      .addSelect(['checkout_counters.alias_value', 'checkout_counters.description'])
      .innerJoin('merchant.dfsps', 'dfsp')
      .andWhere('dfsp.id = :dfspId', { dfspId: portalUser.dfsp.id })
      .andWhere(whereClause)
      .orderBy('merchant.created_at', 'DESC') // Sort by latest

    logger.debug('WhereClause: %o', whereClause)

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

    // Add pagination
    queryBuilder
      .skip(skip)
      .take(Number(limit))

    const totalCount = await queryBuilder.getCount()
    const totalPages = Math.ceil(totalCount / Number(limit))

    const merchants = await queryBuilder.getMany()

    merchants.forEach((merchant: any) => {
      delete merchant.created_by?.password
      delete merchant.created_by?.created_at
      delete merchant.created_by?.updated_at

      delete merchant.checked_by?.password
      delete merchant.checked_by?.created_at
      delete merchant.checked_by?.updated_at
    })

    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.SUCCESS,
      'getMerchants',
      `User ${portalUser.id} with email ${portalUser.email} retrieved merchants`,
      'Merchants',
      {}, { queryParams: req.query }, portalUser
    )

    res.send({ message: 'OK', data: merchants, totalPages })
  } catch (e) /* istanbul ignore next */ {
    logger.error(e)

    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getMerchants',
      `Error: ${JSON.stringify(e)}`,
      'Merchants',
      {}, { e }, portalUser
    )
    res.status(500).send({ message: e })
  }
}
