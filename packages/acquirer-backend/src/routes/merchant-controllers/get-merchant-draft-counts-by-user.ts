/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Request, type Response } from 'express'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../logger'
import { MerchantRegistrationStatus } from 'shared-lib'
import { getAuthenticatedPortalUser } from '../../middleware/authenticate'

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
export async function getMerchantDraftCountsByUser (req: Request, res: Response) {
  const portalUser = await getAuthenticatedPortalUser(req.headers.authorization)
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const merchantRepository = AppDataSource.getRepository(MerchantEntity)

    const whereClause: Partial<MerchantEntity> = {}
    whereClause.created_by = portalUser
    whereClause.registration_status = MerchantRegistrationStatus.DRAFT

    // Need to use query builder to do a LIKE query
    const queryBuilder = merchantRepository.createQueryBuilder('merchant')
    const merchantDraftCountsByUser = await queryBuilder
      .where(whereClause)
      .getCount()

    res.send({ message: 'OK', data: merchantDraftCountsByUser })
  } catch (e) {
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
