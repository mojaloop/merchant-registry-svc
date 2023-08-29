/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/data-source'
import logger from '../../services/logger'
import { type AuditTrasactionStatus, type AuditActionType } from 'shared-lib'
import { AuditEntity } from '../../entity/AuditEntity'
import { type AuthRequest } from 'src/types/express'

/**
 * @openapi
 * /audits:
 *   get:
 *     tags:
 *       - Audits
 *     security:
 *       - Authorization: []
 *     summary: GET Audit Logs
 *     parameters:
 *       - in: query
 *         name: actionType
 *         schema:
 *           type: string
 *           enum: [UnauthorizedAccess, Access, Add, Update, Delete]
 *         description: The action type
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
 *       - in: query
 *         name: entityName
 *         schema:
 *           type: string
 *         description: The entity name
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
export async function getAudits (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const {
      actionType,
      applicationModule,
      entityName,
      transactionStatus
    } = req.query

    logger.debug('req.query: %o', req.query)

    const AuditRepository = AppDataSource.getRepository(AuditEntity)

    const whereClause: Partial<AuditEntity> = {}

    if (typeof actionType === 'string' && actionType.length > 0) {
      whereClause.action_type = actionType as AuditActionType
    }

    if (typeof applicationModule === 'string' && applicationModule.length > 0) {
      whereClause.application_module = applicationModule
    }

    if (typeof entityName === 'string' && entityName.length > 0) {
      whereClause.entity_name = entityName
    }

    if (typeof transactionStatus === 'string' && transactionStatus.length > 0) {
      whereClause.transaction_status = transactionStatus as AuditTrasactionStatus
    }

    const queryBuilder = AuditRepository.createQueryBuilder('audit')
    queryBuilder
      .where(whereClause)
      .orderBy('audit.created_at', 'DESC') // Sort by latest

    logger.debug('WhereClause: %o', whereClause)

    const audits = await queryBuilder.getMany()
    res.send({ message: 'OK', data: audits })
  } catch (e) {
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
