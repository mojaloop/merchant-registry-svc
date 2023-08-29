/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import { MerchantRegistrationStatus, AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { audit } from '../../utils/audit'
import { type AuthRequest } from 'src/types/express'
/**
 * @openapi
 * /merchants/draft-counts:
 *   get:
 *     tags:
 *       - Merchants
 *     security:
 *       - Authorization: []
 *     summary: GET Merchants Draft Count
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
 *                   type: string
 *                   description: merchant drafts counts
 *                   example: 4
 *
 */
// TODO: Protect the route
export async function getMerchantDraftCountsByUser (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const merchantRepository = AppDataSource.getRepository(MerchantEntity)

    const whereClause: Partial<MerchantEntity> = {}
    // TODO: Add where clause for DFSP specific
    whereClause.registration_status = MerchantRegistrationStatus.DRAFT

    // Need to use query builder to do a LIKE query
    const queryBuilder = merchantRepository.createQueryBuilder('merchant')
    const merchantDraftCountsByUser = await queryBuilder
      .where(whereClause)
      .getCount()

    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.SUCCESS,
      'getMerchantDraftCountsByUser',
      `User ${portalUser.email} successfully retrieved merchant draft counts`,
      'Merchants',
      {}, {}, portalUser
    )
    return res.send({ message: 'OK', data: merchantDraftCountsByUser })
  } catch (e: any) {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getMerchantDraftCountsByUser',
      `Error: ${JSON.stringify(e)}`,
      'Merchants',
      { }, { e }, portalUser
    )
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
