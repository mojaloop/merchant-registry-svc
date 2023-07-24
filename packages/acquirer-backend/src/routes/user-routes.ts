/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import * as z from 'zod'
import { AppDataSource } from '../database/data-source'
import { PortalUserEntity } from '../entity/PortalUserEntity'
import logger from '../logger'

export const LoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Portal Users
 *     summary: GET Portal Users List
 *     responses:
 *       200:
 *         description: GET Portal Users List
 */
// TODO: Protect the route with Keycloak middleware
const router = express.Router()
router.get('/users', async (_req: Request, res: Response) => {
  const users = await AppDataSource.manager.find(PortalUserEntity)
  res.send({ message: 'List of users', data: users })
})

/**
 * @openapi
 * /users/login:
 *   post:
 *     tags:
 *       - Portal Users
 *     summary: Authenticate a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test_maker@email.com"
 *                 description: "The email for login"
 *               password:
 *                 type: string
 *                 example: "password"
 *                 description: "The password for login in clear text"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *       422:
 *         description: Validation error
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *
 */
router.post('/users/login', async (req: Request, res: Response) => {
  try {
    LoginFormSchema.parse(req.body)
  } catch (err) {
    if (err instanceof z.ZodError) {
      logger.error('Validation error: %o', err.issues.map(issue => issue.message))
      return res.status(422).send({ error: err.issues.map(issue => issue.message) })
    }
  }
  try {
    const user = await AppDataSource.manager.findOne(
      PortalUserEntity,
      { where: { email: req.body.email } }
    )

    //
    // TODO: use keycloak to authenticate and token generation
    //
    if ((user != null) && await bcrypt.compare(req.body.password, user.password)) {
      logger.info('User %s logged in successfully.', user.email)
      res.json({ success: true, mesaage: 'Login successful' })
    } else {
      throw new Error('Invalid credentials')
    }
  } catch (error) {
    logger.error('User %s login failed.', req.body.email)
    res
      .status(400)
      .send({ success: false, message: 'Invalid credentials' })
  }
})
export default router
