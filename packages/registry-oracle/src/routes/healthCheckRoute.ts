import express, { type Request, type Response } from 'express'

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

export default router
