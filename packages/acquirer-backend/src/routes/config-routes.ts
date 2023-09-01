/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Response } from 'express'
import { type AuthRequest } from 'src/types/express'
import { checkPermissions } from '../middleware/check-permissions'
import { authenticateJWT } from '../middleware/authenticate'
import { PermissionsEnum } from '../types/permissions'
import logger from '../services/logger'

/**
 * @openapi
 * /config/trace-level:
 *   put:
 *     tags:
 *       - Server Configuration
 *     security:
 *       - Authorization: []
 *     summary: Set the log level
 *     description: This endpoint allows you to set the logging level
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: string
 *                 description: The registration status of the merchant
 *                 enum: [error, warn, info, http, verbose, debug, silly]
 *                 example: "error"
 *     responses:
 *       200:
 *         description: Log level set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid log level
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid log level: error"
 */
const router = express.Router()
router.put('/config/trace-level',
  authenticateJWT,
  checkPermissions(PermissionsEnum.EDIT_SERVER_LOG_LEVEL),
  async (req: AuthRequest, res: Response) => {
    const portalUser = req.user
    if (portalUser == null) {
      return res.status(401).send({ message: 'Unauthorized' })
    }
    const level: string = req.body.level

    if (
      ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'].includes(level)
    ) {
      logger.level = level
      logger.info(`New Log Level set: ${level}`)
      return res.send({ message: 'Log level set successfully' })
    } else {
      return res.status(400).send({ message: `Invalid log level: ${level}` })
    }
  })

export default router
