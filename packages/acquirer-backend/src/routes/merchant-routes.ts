/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Request, type Response } from 'express'
import * as z from 'zod'
import { AppDataSource } from '../database/data-source'
import { MerchantEntity } from '../entity/MerchantEntity'
import logger from '../logger'
import { QueryFailedError } from 'typeorm'

export const MerchantSubmitDataSchema = z.object({
  id: z.number().optional(),
  dba_trading_name: z.string().optional(),
  registered_name: z.string().optional(),
  employees_num: z.string(),
  monthly_turnover: z.number().optional(),

  // Will be default to 'PENDING' during submission/drafting
  // Status will be updated by the separate API route
  // allow_block_status: z.nativeEnum(MerchantAllowBlockStatus),

  // Will be default to 'DRAFT'
  // Status will be updated by the separate API route
  // registration_status: z.nativeEnum(MerchantRegistrationStatus).optional(),

  registration_status_reason: z.string().optional(),
  currency_code: z.string(),
  category_code: z.string(),
  locations: z.array(z.number()).optional(),
  checkout_counters: z.array(z.number()).optional(),
  business_licenses: z.array(z.number()).optional(),
  business_owners: z.array(z.number()).optional(),
  contact_persons: z.array(z.number()).optional(),
  dfsp_merchant_relations: z.array(z.number()).optional()
})

const router = express.Router()

/**
 * @openapi
 * /api/v1/merchants:
 *   get:
 *     tags:
 *       - Merchants
 *     summary: GET Merchants List
 *     responses:
 *       200:
 *         description: GET Merchants List
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
 *
 */
// TODO: Protect the route
router.get('/merchants', async (req: Request, res: Response) => {
  // TODO: Filtering... e.g. by status
  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const merchants = await merchantRepository.find({})
  res.send({ message: 'OK', data: merchants })
})

/**
 * @openapi
 * /api/v1/merchants/draft:
 *   post:
 *     tags:
 *       - Merchants
 *     summary: Create a new Merchant Draft
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dba_trading_name:
 *                 type: string
 *                 description: "The DBA Trading Name of the merchant"
 *                 example: "Merchant 1"
 *               registered_name:
 *                 type: string
 *                 description: "The Registered Name of the merchant"
 *                 example: "Merchant 1"
 *               employees_num:
 *                 type: string
 *                 description: "The number of employees of the merchant"
 *                 example: "1 - 10"
 *               monthly_turnover:
 *                 type: number
 *                 description: "The monthly turnover percentage of the merchant"
 *                 example: 0.5
 *               currency_code:
 *                 type: string
 *                 description: "The currency code of the merchant"
 *                 example: "PHP"
 *               category_code:
 *                 type: string
 *                 description: "The merchant SIC category code"
 *                 example: "10410"
 *
 *     responses:
 *       200:
 *         description:
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
// TODO: Protect the route
router.post('/merchants/draft', async (req: Request, res: Response) => {
  // Validate the Request Body
  try {
    MerchantSubmitDataSchema.parse(req.body)
  } catch (err) {
    if (err instanceof z.ZodError) {
      logger.error('Validation error: %o', err.issues)
      return res.status(400).send({ error: err.issues })
    }
  }

  const merchantRepository = AppDataSource.getRepository(MerchantEntity)
  const merchant = merchantRepository.create(req.body)
  try {
    await merchantRepository.save(merchant)
  } catch (err) {
    if (err instanceof QueryFailedError) {
      logger.error('Query Failed: %o', err.message)
      return res.status(400).send({ error: err.message })
    }
    logger.error('Error: %o', err)
    return res.status(500).send({ error: err })
  }

  return res.status(200).send({ message: 'Drafting Merchant Successful.' })
})

export default router
