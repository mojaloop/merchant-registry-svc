/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Request, type Response } from 'express'
import { type AuditTrasactionStatus, type AuditActionType } from 'shared-lib'
import { AppDataSource } from '../database/dataSource'
import { AuditEntity } from '../entity/AuditEntity'
import logger from '../services/logger'

const router = express.Router()
router.get('/audits', getAudits)

export default router

/**
 * @openapi
 * tags:
 *   name: Audits
 * /audits:
 *   get:
 *     tags:
 *       - Audits
 *     security:
 *       - Authorization: []
 *     summary: GET Audit Logs
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
async function getAudits (req: Request, res: Response) {
  try {
    const {
      actionType,
      applicationModule,
      entityName,
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

    const totalCount = await queryBuilder.getCount()
    const totalPages = Math.ceil(totalCount / Number(limit))

    // Add pagination
    queryBuilder
      .skip(skip)
      .take(Number(limit))
    logger.debug('WhereClause: %o', whereClause)

    const audits = await queryBuilder.getMany()
    res.send({ message: 'OK', data: audits, totalPages })
  } catch (e) {
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
