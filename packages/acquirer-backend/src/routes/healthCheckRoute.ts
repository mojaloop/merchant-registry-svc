/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Request, type Response } from 'express'
import { readEnv } from '../setup/readEnv'
import { checkSendGridAPIKeyValidity } from '../utils/sendGrid'

/**
 * @openapi
 * tags:
 *   name: Health Check
 *
 * /health-check:
 *   get:
 *     tags:
 *       - Health Check
 *     summary: Health Check
 *     responses:
 *       200:
 *         description: Health Check
 */
const router = express.Router()
router.get('/health-check', (_req: Request, res: Response) => {
  res.send({ message: 'OK' })
})

/**
 * @openapi
 * tags:
 *   name: Health Check
 *
 * /health-check/sendgrid-email-service:
 *   get:
 *     tags:
 *       - Health Check
 *     summary: Health Check
 *     responses:
 *       200:
 *         description: Health Check for SendGrid Email Service
 */
router.get('/health-check/sendgrid-email-service', async (_req: Request, res: Response) => {
  const apiKey = readEnv('SENDGRID_API_KEY', '<invalid-api-key>') as string
  const isValid = await checkSendGridAPIKeyValidity(apiKey)
  if (!isValid) {
    res.status(500).send({ message: 'SendGrid API Key is Invalid' })
    return
  }
  res.send({ message: 'OK' })
})

export default router
