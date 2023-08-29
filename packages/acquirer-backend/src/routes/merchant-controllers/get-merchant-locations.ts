/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/data-source'
import logger from '../../services/logger'
import { MerchantEntity } from '../../entity/MerchantEntity'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { type AuthRequest } from 'src/types/express'
/**
 * @openapi
 * /merchants/{id}/locations:
 *   get:
 *     tags:
 *       - Merchants
 *       - Merchant Locations
 *     security:
 *       - Authorization: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *        required: true
 *        description: Numeric ID of the Merchant Record
 *     summary: GET Merchant Location List
 *     responses:
 *       200:
 *         description: GET Merchant Location List
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
// TODO: Protect the route
export async function getMerchantLocations (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  if (req.params.id == null || req.params.id === undefined) {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getMerchantLocations',
      'Missing merchant id',
      'Merchant',
      {}, {}, portalUser
    )

    res.status(400).send({ message: 'Missing merchant id' })
    return
  }

  if (isNaN(Number(req.params.id)) || Number(req.params.id) < 1) {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getMerchantLocations',
      `Invalid merchant id: ${req.params.id} `,
      'Merchant',
      {}, {}, portalUser
    )
    res.status(400).send({ message: 'Invalid merchant id' })
    return
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  try {
    const merchant = await merchantRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: [
        'locations',
        'locations.checkout_counters'
      ]
    })

    if (merchant == null) {
      await audit(
        AuditActionType.ACCESS,
        AuditTrasactionStatus.FAILURE,
        'getMerchantLocations',
        `Merchant Not Found: ${req.params.id}`,
        'Merchant',
        {}, {}, portalUser
      )
      res.status(404).send({ message: 'Merchant not found' })
      return
    }

    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.SUCCESS,
      'getMerchantLocations',
      `User ${portalUser.id} with email ${portalUser.email} \
retrieved locations for merchant ${merchant.id}`,
      'Merchant',
      {}, {}, portalUser
    )
    const locations = merchant.locations
    res.send({ message: 'OK', data: locations })
  } catch (e) {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getMerchantLocations',
      `Error: ${JSON.stringify(e)}`,
      'Merchant',
      {}, { e }, portalUser
    )
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
