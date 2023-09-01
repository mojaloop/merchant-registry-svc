/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import { MerchantRegistrationStatus, AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { In } from 'typeorm'
import { audit } from '../../utils/audit'
import { type AuthRequest } from 'src/types/express'

/**
 * @openapi
 * /merchants/bulk-revert:
 *   put:
 *     tags:
 *       - Merchants
 *       - Merchant Status
 *     security:
 *       - Authorization: []
 *     summary: Bulk Revert the registration status of multiple Merchant Records
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: List of Merchant Record IDs to be updated
 *                 example: [1, 2, 3]
 *               reason:
 *                 type: string
 *                 description: Reason for reverting the merchant
 *                 example: "Information need to be updated"
 *     responses:
 *       200:
 *         description: Status Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

export async function putBulkRevert (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  if (req.body.reason === undefined || req.body.reason == null || req.body.reason === '') {
    await audit(
      AuditActionType.UPDATE,
      AuditTrasactionStatus.FAILURE,
      'putBulkRevert',
      'Reason is required',
      'Merchant',
      {}, {}, portalUser
    )
    return res.status(422).send({ message: 'Reason is required' })
  }

  const ids: number[] = req.body.ids
  const merchantRepository = AppDataSource.getRepository(MerchantEntity)

  // Validate IDs
  if (!Array.isArray(ids)) throw new Error('IDs must be an array of numbers.')
  for (const id of ids) {
    if (isNaN(Number(id)) || Number(id) < 1) {
      await audit(
        AuditActionType.UPDATE,
        AuditTrasactionStatus.FAILURE,
        'putBulkRevert',
        'ID must be a valid ID number',
        'Merchant',
        {}, {}, portalUser
      )

      return res.status(422).send({ message: 'Each ID in the array must be a valid ID number.' })
    }
  }

  if (req.body.reason === undefined || req.body.reason == null || req.body.reason === '') {
    await audit(
      AuditActionType.UPDATE,
      AuditTrasactionStatus.FAILURE,
      'putBulkRevert',
      'Reason is required',
      'Merchant',
      {}, {}, portalUser
    )
    return res.status(422).send({ message: 'Reason is required' })
  }

  const merchants = await merchantRepository.find({
    where: {
      id: In(ids)
      // registration_status: MerchantRegistrationStatus.REVIEW,
      // created_by: Not(portalUser.id)
    },
    relations: ['created_by', 'dfsp']
  })

  for (const merchant of merchants) {
    const validMerchantForUser = merchant.dfsps
      .map(dfsp => dfsp.id)
      .includes(portalUser.dfsp.id)
    if (!validMerchantForUser) {
      logger.error('Accessing different DFSP\'s Merchant is not allowed.')
      await audit(
        AuditActionType.ACCESS,
        AuditTrasactionStatus.FAILURE,
        'putMerchantReject',
          `User ${portalUser.id} (${portalUser.email}) 
trying to access unauthorized(different DFSP) merchant ${merchant.id}`,
          'MerchantEntity',
          {}, {}, portalUser
      )
      return res.status(400).send({
        message: 'Accessing different DFSP\'s Merchant is not allowed.'
      })
    }

    if (merchant.registration_status !== MerchantRegistrationStatus.REVIEW) {
      await audit(
        AuditActionType.UPDATE,
        AuditTrasactionStatus.FAILURE,
        'putBulkRevert',
        'Merchant is not in Review Status',
        'Merchant',
        {}, {}, portalUser
      )
      return res.status(422).send({
        // eslint-disable-next-line max-len
        message: `Merchant ${merchant.id} is not in Review Status. Current Status: ${merchant.registration_status}`
      })
    }

    if (merchant.created_by?.id === portalUser.id) {
      await audit(
        AuditActionType.UPDATE,
        AuditTrasactionStatus.FAILURE,
        'putBulkRevert',
        'Merchant cannot be reverted by the same user who submitted it',
        'Merchant',
        {}, {}, portalUser
      )
      return res.status(422).send({
        message: `Merchant ${merchant.id} cannot be reverted by the same user who submitted it.`
      })
    }
  }

  try {
    await merchantRepository
      .createQueryBuilder()
      .update(MerchantEntity)
      .set({
        registration_status: MerchantRegistrationStatus.REVERTED,
        registration_status_reason: req.body.reason,
        checked_by: portalUser
      })
      .whereInIds(ids)
      .execute()

    await audit(
      AuditActionType.UPDATE,
      AuditTrasactionStatus.SUCCESS,
      'putBulkReject',
      'Status Updated to Reverted Status',
      'Merchant',
      {}, {}, portalUser
    )
    res.status(200).send({
      message: 'Status Updated to "Reverted" for multiple merchants'
    })
  } catch (e) {
    logger.error(e)
    await audit(
      AuditActionType.UPDATE,
      AuditTrasactionStatus.FAILURE,
      'putBulkReject',
      'Status Update Failed',
      'Merchant',
      {}, {}, portalUser
    )
    res.status(500).send({ message: e })
  }
}
