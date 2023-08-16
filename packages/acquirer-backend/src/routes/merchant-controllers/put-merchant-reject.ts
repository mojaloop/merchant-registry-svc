/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Request, type Response } from 'express'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../logger'
import { getAuthenticatedPortalUser } from '../../middleware/authenticate'
import { MerchantRegistrationStatus, AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { QueryFailedError } from 'typeorm'
import { audit } from '../../utils/audit'

/**
 * @openapi
 * /merchants/{id}/reject:
 *   put:
 *     tags:
 *       - Merchants
 *       - Merchant Status
 *     summary: Updates the status of a Merchant to 'Reject'
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the merchant to update
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejecting the merchant
 *                 example: "Information provided is not sufficient"
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
export async function putMerchantReject (req: Request, res: Response) {
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

  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      logger.error('Invalid Merchant ID')
      await audit(
        AuditActionType.UPDATE,
        AuditTrasactionStatus.FAILURE,
        'putMerchantReject',
        'Invalid Merchant ID',
        'Merchant',
        {}, {}, portalUser
      )
      res.status(422).send({ message: 'Invalid Merchant ID' })
      return
    }

    const merchantRepository = AppDataSource.getRepository(MerchantEntity)
    const merchant = await merchantRepository.findOne({
      where: { id },
      relations: [
        'created_by'
      ]
    })

    if (merchant == null) {
      await audit(
        AuditActionType.UPDATE,
        AuditTrasactionStatus.FAILURE,
        'putMerchantReject',
        'Merchant not found',
        'Merchant',
        {}, {}, portalUser
      )
      return res.status(404).send({ message: 'Merchant not found' })
    }

    if (portalUser.id === merchant.created_by.id) {
      const msg = 'User is not allowed to change status'

      await audit(
        AuditActionType.UPDATE,
        AuditTrasactionStatus.FAILURE,
        'putMerchantReject',
        msg,
        'Merchant',
        {}, {}, portalUser
      )
      logger.error(msg)
      return res.status(400).send({
        message: msg
      })
    }

    if (merchant.registration_status !== MerchantRegistrationStatus.REVIEW) {
      const msg = 'Only Review Merchant can be approved with Rejected'
      await audit(
        AuditActionType.UPDATE,
        AuditTrasactionStatus.FAILURE,
        'putMerchantReject',
        msg,
        'Merchant',
        {}, {}, portalUser
      )

      logger.error(msg)
      return res.status(401).send({
        message: msg
      })
    }

    merchant.registration_status = MerchantRegistrationStatus.REJECTED
    merchant.registration_status_reason = req.body.reason
    merchant.checked_by = portalUser

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
      AuditTrasactionStatus.SUCCESS,
      'putWaitingAliasGeneration',
      'Updating Merchant Status to Rejected Successful',
      'Merchant',
      { registration_status: MerchantRegistrationStatus.REVIEW },
      { registration_status: MerchantRegistrationStatus.REJECTED },
      portalUser
    )

    return res.status(200).send(
      { message: 'Status Updated to Rejected', data: merchantData }
    )
  } catch (e) {
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
