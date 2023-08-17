/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Request, type Response } from 'express'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../logger'
import { MerchantRegistrationStatus, AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { getAuthenticatedPortalUser } from '../../middleware/authenticate'
import { In, Not } from 'typeorm'
import { audit } from '../../utils/audit'

/**
 * @openapi
 * /merchants/bulk-reject:
 *   put:
 *     tags:
 *       - Merchants
 *       - Merchant Status
 *     security:
 *       - Authorization: []
 *     summary: Bulk Rejected the registration status of multiple Merchant Records
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
 *                 description: Reason for rejecting the merchant
 *                 example: "Information provided is not sufficient"
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

export async function putBulkReject (req: Request, res: Response) {
  const portalUser = await getAuthenticatedPortalUser(req.headers.authorization)
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  if (req.body.reason === undefined || req.body.reason == null || req.body.reason === '') {
    await audit(
      AuditActionType.UPDATE,
      AuditTrasactionStatus.FAILURE,
      'putBulkReject',
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
        'putBulkReject',
        'ID must be a valid ID number',
        'Merchant',
        {}, {}, portalUser
      )

      return res.status(422).send({ message: 'Each ID in the array must be a valid ID number.' })
    }
  }

  const merchants = await merchantRepository.find({
    where: {
      id: In(ids)
    },
    relations: ['created_by']
  })

  for (const merchant of merchants) {
    if (merchant.registration_status !== MerchantRegistrationStatus.REVIEW) {
      await audit(
        AuditActionType.UPDATE,
        AuditTrasactionStatus.FAILURE,
        'putBulkReject',
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
        'putBulkReject',
        'Merchant cannot be rejected by the same user who submitted it',
        'Merchant',
        {}, {}, portalUser
      )
      return res.status(422).send({
        message: `Merchant ${merchant.id} cannot be rejected by the same user who submitted it.`
      })
    }
  }

  try {
    await merchantRepository
      .createQueryBuilder()
      .update(MerchantEntity)
      .set({
        registration_status: MerchantRegistrationStatus.REJECTED,
        registration_status_reason: req.body.reason,
        checked_by: portalUser
      })
      .whereInIds(ids)
      .execute()

    await audit(
      AuditActionType.UPDATE,
      AuditTrasactionStatus.SUCCESS,
      'putBulkReject',
      'Status Updated to Rejected Status',
      'Merchant',
      {}, {}, portalUser
    )
    res.status(200).send({
      message: 'Status Updated to "Rejected" for multiple merchants'
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
