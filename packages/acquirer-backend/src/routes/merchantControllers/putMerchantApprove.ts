/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import { MerchantRegistrationStatus, AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { QueryFailedError } from 'typeorm'
import { audit } from '../../utils/audit'
import { type AuthRequest } from 'src/types/express'
import { publishToQueue } from '../../services/messageQueue'

/**
 * @openapi
 * /merchants/{id}/approve:
 *   put:
 *     tags:
 *       - Merchants
 *       - Merchant Status
 *     summary: Updates the status of a Merchant to 'Waiting For Alias Generation'
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
export async function putWaitingAliasGeneration (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      logger.error('Invalid Merchant ID')
      res.status(422).send({ message: 'Invalid Merchant ID' })
      return
    }

    const merchantRepository = AppDataSource.getRepository(MerchantEntity)
    const merchant = await merchantRepository.findOne({
      where: { id },
      relations: [
        'created_by',
        // 'checked_by',
        'dfsps',
        'checkout_counters' // For pushing to queue
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
        AuditTrasactionStatus.FAILURE,
        'putWaitingAliasGeneration',
          `User ${portalUser.id} (${portalUser.email}) 
trying to access unauthorized(different DFSP) merchant ${merchant.id}`,
          'MerchantEntity',
          {}, {}, portalUser
      )
      return res.status(400).send({
        message: 'Accessing different DFSP\'s Merchant is not allowed.'
      })
    }

    if (portalUser.id === merchant.created_by.id) {
      logger.error('User is not allowed to change status')
      return res.status(400).send({
        message: 'User is not allowed to change status'
      })
    }

    if (merchant.registration_status !== MerchantRegistrationStatus.REVIEW) {
      logger.error('Only Review Merchant can be approved with "Waiting For Alias Generation"')
      return res.status(401).send({
        message: 'Only Review Merchant can be approved with "Waiting For Alias Generation"'
      })
    }

    merchant.registration_status = MerchantRegistrationStatus.WAITINGALIASGENERATION
    merchant.registration_status_reason = 'Status Updated to "Waiting For Alias Generation"'

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

    await publishToQueue({ command: 'generateAlias', data: merchantData })

    await audit(
      AuditActionType.UPDATE,
      AuditTrasactionStatus.SUCCESS,
      'putWaitingAliasGeneration',
      'Updating Merchant Status to "Waiting For Alias Generation" Successful',
      'Merchant',
      { registration_status: MerchantRegistrationStatus.REVIEW },
      { registration_status: MerchantRegistrationStatus.WAITINGALIASGENERATION },
      portalUser
    )

    return res.status(200).send(
      { message: 'Status Updated to "Waiting For Alias Generation"', data: merchantData }
    )
  } catch (e) {
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
