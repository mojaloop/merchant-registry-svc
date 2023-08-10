/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Request, type Response } from 'express'
import { QueryFailedError } from 'typeorm'
import * as z from 'zod'
import { AppDataSource } from '../../database/data-source'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../logger'
import { getAuthenticatedPortalUser } from '../../middleware/authenticate'
import {
  MerchantRegistrationStatus
} from 'shared-lib'

/**
 * @openapi
 * /merchants/{id}/registration-status:
 *   put:
 *     tags:
 *       - Merchants
 *     security:
 *       - Authorization: []
 *     summary: Update the registration status of Merchant Record
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *        required: true
 *        description: Numeric ID of the Merchant Record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               registration_status:
 *                 type: string
 *                 description: The registration status of the merchant
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
 *                 data:
 *                   type: object
 */
// TODO: Protect the route with User Authentication (Keycloak)
export async function putMerchantRegistrationStatus (req: Request, res: Response) {
  const portalUser = await getAuthenticatedPortalUser(req.headers.authorization)
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

    // Validate the Request Body
    try {
      z.nativeEnum(MerchantRegistrationStatus).parse(req.body.registration_status)
    } catch (err) {
      if (err instanceof z.ZodError) {
        logger.error('Validation error: %o', err.issues.map((issue) => issue.message))
        return res.status(422).send({ error: err.issues.map((issue) => issue.message) })
      }
    }

    const merchantRepository = AppDataSource.getRepository(MerchantEntity)
    const merchant = await merchantRepository.findOne({
      where: { id: Number(req.params.id) },
      relations: [
        'created_by'
      ]
    })
    if (merchant == null) {
      return res.status(404).send({ message: 'Merchant not found' })
    }

    if (portalUser == null || merchant.created_by.id === portalUser.id) {
      return res.status(401).send({
        message: 'Same Hub User cannot do both Sumitting and Review Checking'
      })
    }

    merchant.registration_status = req.body.registration_status
    merchant.registration_status_reason = req.body.registration_status_reason
    merchant.checked_by = portalUser
    // TODO: associate checked_by with the current user (Checker)
    // merchant.checked_by = checker_user_id

    try {
      await merchantRepository.save(merchant)
    } catch (err) {
      if (err instanceof QueryFailedError) {
        logger.error('Query Failed: %o', err.message)
        return res.status(500).send({ error: err.message })
      }
    }

    // Remove created_by from the response to prevent password hash leaking
    const merchantData = {
      ...merchant,
      created_by: undefined,
      checked_by: undefined
    }
    res.status(200).send({ message: 'Status Updated', data: merchantData })
  } catch (e) {
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
