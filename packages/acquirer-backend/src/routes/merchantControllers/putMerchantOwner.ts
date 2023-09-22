/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import * as z from 'zod'
import { AppDataSource } from '../../database/dataSource'
import { MerchantEntity } from '../../entity/MerchantEntity'
import logger from '../../services/logger'
import { BusinessOwnerEntity } from '../../entity/BusinessOwnerEntity'
import { BusinessPersonLocationEntity } from '../../entity/BusinessPersonLocationEntity'

import {
  BusinessOwnerSubmitDataSchema
} from '../schemas'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { audit } from '../../utils/audit'
import { type AuthRequest } from 'src/types/express'

/**
 * @openapi
 *
 * tags:
 *   name: Business Owners
 *
 * /merchants/{merchantId}/business-owners/{ownerId}:
 *   put:
 *     tags:
 *       - Merchants
 *       - Business Owners
 *     security:
 *       - Authorization: []
 *     summary: Update a business owner of Merchant
 *     parameters:
 *      - in: path
 *        name: merchantId
 *        schema:
 *          type: number
 *        required: true
 *        description: Numeric ID of the Merchant Record
 *      - in: path
 *        name: ownerId
 *        schema:
 *          type: number
 *        required: true
 *        description: Numeric ID of the Business Owner Record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe Updated"
 *               email:
 *                 type: string
 *                 example: "john.doe.updated@example.com"
 *               phone_number:
 *                 type: string
 *                 example: "1234567890222"
 *               identificaton_type:
 *                 type: string
 *                 example: "National ID"
 *               identification_number:
 *                 type: string
 *                 example: "1234567892222"
 *               country:
 *                 type: string
 *                 example: "Argentina"
 *               country_subdivision:
 *                 type: string
 *                 example: "State Updated"
 *               address_line:
 *                 type: string
 *                 example: "123 Main Street, Townsville Updated"
 *               latitude:
 *                 type: string
 *                 example: "99.7128"
 *               longitude:
 *                 type: string
 *                 example: "99.0060"
 *
 *     responses:
 *       201:
 *         description: Business Owner Updated
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
export async function putMerchantOwner (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const merchantId = Number(req.params.merchantId)
  if (isNaN(merchantId) || merchantId <= 0) {
    logger.error('Invalid Merchant ID')
    res.status(422).send({ message: 'Invalid Merchant ID' })
    return
  }

  const ownerId = Number(req.params.ownerId)
  if (isNaN(ownerId) || ownerId <= 0) {
    logger.error('Invalid Owner ID')
    res.status(422).send({ message: 'Invalid Owner ID' })
    return
  }

  const businessOwnerData = req.body
  // Validate the Request Body
  try {
    BusinessOwnerSubmitDataSchema.parse(businessOwnerData)
  } catch (err) {
    if (err instanceof z.ZodError) {
      logger.error('Business Owner Validation error: %o', err.issues.map(issue => issue.message))
      return res.status(422).send({ message: err.issues.map(issue => issue.message) })
    }
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const businessOwnerRepository = AppDataSource.getRepository(BusinessOwnerEntity)
  const locationRepository = AppDataSource.getRepository(BusinessPersonLocationEntity)

  const merchant = await merchantRepository.findOne(
    {
      where: { id: merchantId },
      relations: [
        'business_owners',
        'business_owners.businessPersonLocation',
        'dfsps'
      ]
    }
  )

  if (merchant == null) {
    logger.error('Merchant not found')
    return res.status(404).json({ message: 'Merchant not found' })
  }

  const validMerchantForUser = merchant.dfsps
    .map(dfsp => dfsp.id)
    .includes(portalUser.dfsp.id)
  if (!validMerchantForUser) {
    logger.error('Accessing different DFSP\'s Merchant is not allowed.')
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'putMerchantContactPerson',
          `User ${portalUser.id} (${portalUser.email}) 
trying to access unauthorized(different DFSP) merchant ${merchant.id}`,
          'MerchantEntity',
          {}, {}, portalUser
    )
    return res.status(400).send({
      message: 'Accessing different DFSP\'s Merchant is not allowed.'
    })
  }

  const businessOwner = merchant.business_owners.find(owner => owner.id === ownerId)
  if (businessOwner == null) {
    logger.error('Business Owner with provided Merchant not found')
    return res.status(404).json({ message: 'Business Owner with provided Merchant not found' })
  }

  // clone for audit log
  const oldBusinessOwner = {
    name: businessOwner.name,
    email: businessOwner.email,
    phone_number: businessOwner.phone_number,
    identificaton_type: businessOwner.identificaton_type,
    identification_number: businessOwner.identification_number
  }

  try {
    const locationObj = businessOwner.businessPersonLocation
    const newLocationData = {
      ...businessOwnerData
    }

    // Remove the fields that are not part of the Location Entity
    newLocationData.name = undefined
    newLocationData.email = undefined
    newLocationData.phone_number = undefined
    newLocationData.identificaton_type = undefined
    newLocationData.identification_number = undefined

    await locationRepository.update(locationObj.id, newLocationData)
    logger.debug('Updated Owner\'s Location')
  } catch (err) {
    logger.error('Error updating business owner location: %o', err)
    return res.status(500).send({ message: 'Error updating business owner location' })
  }

  let newBusinessOwnerData = {}
  try {
    // Remove the fields that are not part of the Business Owner Entity
    newBusinessOwnerData = {
      name: businessOwnerData.name,
      email: businessOwnerData.email,
      phone_number: businessOwnerData.phone_number,
      identificaton_type: businessOwnerData.identificaton_type,
      identification_number: businessOwnerData.identification_number
    }

    await businessOwnerRepository.update(businessOwner.id, newBusinessOwnerData)
  } catch (err) {
    logger.error('Error Updating Business Owner: %o', err)
    return res.status(500).send({ message: 'Error Updating Business Owner' })
  }

  await audit(
    AuditActionType.UPDATE,
    AuditTrasactionStatus.SUCCESS,
    'putMerchantContactPerson',
    'Contact Person Updated',
    'ContactPerson',
    oldBusinessOwner, newBusinessOwnerData, portalUser
  )
  return res.status(201).send({
    message: 'Business Owner Updated',
    data: businessOwner
  })
}
