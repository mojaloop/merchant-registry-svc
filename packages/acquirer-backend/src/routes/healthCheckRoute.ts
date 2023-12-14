/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Request, type Response } from 'express'
import { readEnv } from '../setup/readEnv'
import { checkSendGridAPIKeyValidity } from '../utils/sendGrid'
import { ApplicationStateEntity } from '../entity/ApplicationStateEntity'
import { AppDataSource } from '../database/dataSource'
import { authenticateJWT } from '../middleware/authenticate'
import { checkPortalUserType } from '../middleware/checkUserType'
import { PortalUserType } from 'shared-lib'

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
 * /health-check/is-hubonboard-complete:
 *   get:
 *     tags:
 *       - Health Check
 *     security:
 *       - Authorization: []
 *     summary: Health Check for Hub Onboarding
 *     responses:
 *       200:
 *         description: Health Check for Hub Onboarding
 */
router.get(
  '/health-check/is-hubonboard-complete',
  authenticateJWT,
  checkPortalUserType(PortalUserType.HUB),
  async (_req: Request, res: Response) => {
    let isHubOnboardingComplete = false
    const appState = await AppDataSource.manager.findOne(ApplicationStateEntity, { where: {} })
    if (appState != null) {
      isHubOnboardingComplete = appState.is_hub_onboarding_complete
    }

    res.send({
      message: isHubOnboardingComplete ? 'Hub Onboarding is Complete' : 'Hub Onboarding is Incomplete',
      isHubOnboardingComplete
    })
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
