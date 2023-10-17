/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import logger from '../../services/logger'
import { MerchantEntity } from '../../entity/MerchantEntity'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { type AuthRequest } from 'src/types/express'

/**
 * @openapi
 *
 * tags:
 *   name: Checkout Counters
 *
 * /merchants/{id}/checkout-counters:
 *   get:
 *     tags:
 *       - Merchants
 *       - Checkout Counters
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
 *         description: GET Merchant Checkout Counter List
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
export async function getMerchantCheckoutCounters (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  if (req.params.id === undefined || req.params.id === null) {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getMerchantCheckoutCounters',
      'Missing merchant id',
      'Merchants',
      {}, {}, portalUser
    )
    res.status(400).send({ message: 'Missing merchant id' })
    return
  }

  if (isNaN(Number(req.params.id)) || Number(req.params.id) < 1) {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getMerchantCheckoutCounters',
      `Invalid merchant id: ${req.params.id}`,
      'Merchants',
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
        'checkout_counters',
        'checkout_counters.checkout_location',
        'dfsps'
      ]
    })

    if (merchant == null) {
      await audit(
        AuditActionType.ACCESS,
        AuditTrasactionStatus.FAILURE,
        'getMerchantCheckoutCounters',
        `Merchant not found: ${req.params.id}`,
        'Merchants',
        {}, {}, portalUser
      )
      res.status(404).send({ message: 'Merchant not found' })
      return
    }

    const validMerchantForUser = merchant.dfsps
      .map(dfsp => dfsp.id)
      .includes(portalUser.dfsp.id)
    if (!validMerchantForUser) {
      logger.error('Accessing different DFSP\'s Merchant is not allowed.')
      await audit(
        AuditActionType.ACCESS,
        AuditTrasactionStatus.FAILURE,
        'getMerchantCheckoutCounters',
          `User ${portalUser.id} (${portalUser.email}) 
trying to access unauthorized(different DFSP) merchant ${merchant.id}`,
          'MerchantEntity',
          {}, {}, portalUser
      )
      return res.status(400).send({
        message: 'Accessing different DFSP\'s Merchant is not allowed.'
      })
    }

    const checkoutCounters = merchant.checkout_counters
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.SUCCESS,
      'getMerchantCheckoutCounters',
      `User ${portalUser.id} with email ${portalUser.email} \
successfully fetched checkout counters for merchant ${merchant.id}`,
      'Merchants',
      {}, {}, portalUser
    )
    res.send({ message: 'OK', data: checkoutCounters })
  } catch (e) {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'getMerchantCheckoutCounters',
      `User ${portalUser.id} with email ${portalUser.email} \
failed to fetch checkout counters for merchant ${req.params.id}`,
      'Merchants',
      {}, {}, portalUser
    )
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
