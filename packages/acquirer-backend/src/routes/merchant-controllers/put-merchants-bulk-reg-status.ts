/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Request, type Response } from 'express'
import * as z from 'zod'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../logger'
import {
  MerchantRegistrationStatus
} from 'shared-lib'
import { getAuthenticatedPortalUser } from '../../middleware/authenticate'

/**
 * @openapi
 * /merchants/registration-status:
 *   put:
 *     tags:
 *       - Merchants
 *     security:
 *       - Authorization: []
 *     summary: Bulk Update the registration status of multiple Merchant Records
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
 *               registration_status:
 *                 type: string
 *                 description: The registration status of the merchants
 *                 example: "Approved"
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

export async function putBulkMerchantRegistrationStatus (req: Request, res: Response) {
  const portalUser = await getAuthenticatedPortalUser(req.headers.authorization)
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const ids: number[] = req.body.ids
  const registrationStatus: string = req.body.registration_status

  // Validate the Request Body
  try {
    if (!Array.isArray(ids)) throw new Error('IDs must be an array of numbers.')
    ids.forEach(id => {
      if (isNaN(Number(id)) || Number(id) < 1) {
        throw new Error('Each ID in the array must be a valid ID number.')
      }
    })
    z.nativeEnum(MerchantRegistrationStatus).parse(registrationStatus)
  } catch (err) {
    logger.error('Validation error: %o', err)
    return res.status(422).send({ error: err })
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)

  try {
    await merchantRepository
      .createQueryBuilder()
      .update(MerchantEntity)
      .set({
        registration_status: registrationStatus as MerchantRegistrationStatus,
        registration_status_reason: 'Bulk Updated'
      })
      .whereInIds(ids)
      .execute()

    res.status(200).send({ message: 'Status Updated for multiple merchants' })
  } catch (e) {
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
