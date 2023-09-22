/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { QueryFailedError } from 'typeorm'
import { AppDataSource } from '../../database/dataSource'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import {
  MerchantRegistrationStatus
  , AuditActionType, AuditTransactionStatus
} from 'shared-lib'
import { audit } from '../../utils/audit'
import { type AuthRequest } from 'src/types/express'

/**
 * @openapi
 * /merchants/{id}/ready-to-review:
 *   put:
 *     tags:
 *       - Merchants
 *       - Merchant Status
 *     summary: Updates the status of a Merchant to 'Review'
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the merchant to update
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: Merchant status successfully updated to Review
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The response message
 *                   example: Status Updated to Review
 *                 data:
 *                   type: object
 *                   description: The updated merchant data
 *       401:
 *         description: Unauthorized request
 *       404:
 *         description: Merchant not found
 *       422:
 *         description: Invalid merchant ID
 *       500:
 *         description: Server error
 */
export async function putMerchantStatusReadyToReview (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      logger.error('Invalid ID')
      res.status(422).send({ message: 'Invalid ID' })
      return
    }

    const merchantRepository = AppDataSource.getRepository(MerchantEntity)
    const merchant = await merchantRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: [
        'created_by',
        'dfsps'
      ]
    })
    if (merchant == null) {
      return res.status(404).send({ message: 'Merchant not found' })
    }

    const validMerchantForUser = merchant.dfsps
      .map(dfsp => dfsp.id)
      .includes(portalUser.dfsp.id)
    if (!validMerchantForUser) {
      logger.error('Accessing different DFSP\'s Merchant is not allowed.')
      await audit(
        AuditActionType.ACCESS,
        AuditTransactionStatus.FAILURE,
        'putMerchantStatusReadyToReview',
          `User ${portalUser.id} (${portalUser.email}) 
          trying to access unauthorized(different DFSP) merchant ${req.params.id}`,
          'MerchantEntity',
          {}, {}, portalUser
      )
      return res.status(400).send({
        message: 'Accessing different DFSP\'s Merchant is not allowed.'
      })
    }

    if (portalUser == null || merchant.created_by.id !== portalUser.id) {
      logger.error('Only the Hub User who submitted the Draft Merchant can mark it as Review')
      return res.status(401).send({
        message: 'Only the Hub User who submitted the Draft Merchant can mark it as Review'
      })
    }

    if (merchant.registration_status !== MerchantRegistrationStatus.DRAFT) {
      logger.error('Only Draft Merchant can be marked as Review')
      return res.status(401).send({
        message: 'Only Draft Merchant can be marked as Review'
      })
    }

    merchant.registration_status = MerchantRegistrationStatus.REVIEW
    merchant.registration_status_reason = 'Ready to Review'

    try {
      await merchantRepository.save(merchant)
    } catch (err) {
      if (err instanceof QueryFailedError) {
        logger.error('Query Failed: %o', err.message)
        return res.status(500).send({ message: err.message })
      }
    }

    // Remove created_by from the response to prevent password hash leaking
    const merchantData = {
      ...merchant,
      created_by: undefined
    }

    await audit(
      AuditActionType.UPDATE,
      AuditTransactionStatus.SUCCESS,
      'putMerchantStatusReadyToReview',
      'Updating Merchant Status to \'Review\' Successful',
      'Merchant',
      { registration_status: MerchantRegistrationStatus.DRAFT },
      { registration_status: MerchantRegistrationStatus.REVIEW },
      portalUser
    )
    res.status(200).send({ message: 'Status Updated to Review', data: merchantData })
  } catch (e) {
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
