/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import logger from '../../services/logger'
import { type AuditTrasactionStatus, type AuditActionType } from 'shared-lib'
import { AuditEntity } from '../../entity/AuditEntity'
import { type AuthRequest } from 'src/types/express'
import { PortalUserEntity } from '../../entity/PortalUserEntity'

/**
 * @openapi
 * tags:
 *   name: Audits
 * /audits/hub:
 *   get:
 *     tags:
 *       - Audits
 *     security:
 *       - Authorization: []
 *     summary: GET Audit Logs Relating to Hub Actions
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number
 *         minimum: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The number of items per page
 *       - in: query
 *         name: actionType
 *         schema:
 *           type: string
 *           enum: [UnauthorizedAccess, Access, Add, Update, Delete]
 *         description: The action type
 *       - in: query
 *         name: portalUserId
 *         schema:
 *           type: integer
 *         description: The ID of the user who did on the action
 *       - in: query
 *         name: transactionStatus
 *         schema:
 *           type: string
 *           enum: [Success, Failure]
 *         description: The transaction status Success or Failure
 *       - in: query
 *         name: applicationModule
 *         schema:
 *           type: string
 *         description: The application module
 *     responses:
 *       200:
 *         description: GET Audit Logs
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
 *                   description: The list of audit logs
 *                   items:
 *                     type: object
 */
export async function getHubAudits (req: AuthRequest, res: Response) {
  const portalUser = req.user
  /* istanbul ignore if */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const {
      actionType,
      portalUserId,
      applicationModule,
      transactionStatus
    } = req.query

    // Pagination parameters
    const { page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    logger.debug('req.query: %o', req.query)

    if (isNaN(skip) || isNaN(Number(limit)) || skip < 0 || Number(limit) < 1) {
      return res.status(400).send({ message: 'Invalid pagination parameters' })
    }

    const AuditRepository = AppDataSource.getRepository(AuditEntity)
    const PortalUserRepository = AppDataSource.getRepository(PortalUserEntity)

    const whereClause: Partial<AuditEntity> = {}

    if (!isNaN(Number(portalUserId)) && Number(portalUserId) > 0) {
      const user = await PortalUserRepository.findOne({ where: { id: Number(portalUserId) } })
      if (user != null) whereClause.portal_user = user
    }

    if (typeof actionType === 'string' && actionType.length > 0) {
      whereClause.action_type = actionType as AuditActionType
    }

    if (typeof applicationModule === 'string' && applicationModule.length > 0) {
      whereClause.application_module = applicationModule
    }

    if (typeof transactionStatus === 'string' && transactionStatus.length > 0) {
      whereClause.transaction_status = transactionStatus as AuditTrasactionStatus
    }

    const queryBuilder = AuditRepository.createQueryBuilder('audit')
    queryBuilder
      .leftJoin('audit.portal_user', 'portal_user')
      .addSelect([
        'portal_user.name',
        'portal_user.email',
        'portal_user.phone_number',
        'portal_user.id'
      ])
      .where(whereClause)

    // Filter by entity_name
    queryBuilder.andWhere('audit.entity_name IN (:...entityNames)', {
      entityNames: [
        'PortalUserEntity', 'DFSPEntity', 'PortalRoleEntity', 'PortalPermissionEntity'
      ]
    })

    const totalCount = await queryBuilder.getCount()
    const totalPages = Math.ceil(totalCount / Number(limit))

    // Add pagination
    queryBuilder
      .skip(skip)
      .take(Number(limit))
    logger.debug('WhereClause: %o', whereClause)

    const audits = await queryBuilder.getMany()
    res.send({ message: 'GET Audit Logs Relating to Merchant Actions', data: audits, totalPages })
  } catch (e)/* istanbul ignore next */ {
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
