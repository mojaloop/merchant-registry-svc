/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import * as z from 'zod'
import { AppDataSource } from '../database/data-source'
import { PortalUserEntity } from '../entity/PortalUserEntity'
import logger from '../logger'
import { getAuthenticatedPortalUser } from '../middleware/authenticate'

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
 *     security:
 *       - Authorization: []
 *     summary: GET Portal Users List
 *     responses:
 *       200:
 *         description: GET Portal Users List
 */
// TODO: Protect the route with Keycloak middleware
const router = express.Router()
router.get('/users', async (req: Request, res: Response) => {
  const portalUser = await getAuthenticatedPortalUser(req.headers.authorization)
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

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
 *                 example: "test1@email.com"
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
    logger.info('User %s login attempt.', req.body.email)

    //
    // TODO: use keycloak to authenticate and token generation
    //
    if ((user != null) && await bcrypt.compare(req.body.password, user.password)) {
      logger.info('User %s logged in successfully.', user.email)

      // Dummy token... TODO: Remove this!
      let token = ''
      if (req.body.email === process.env.TEST1_EMAIL) {
        token = process.env.TEST1_DUMMY_AUTH_TOKEN ?? ''
      } else if (req.body.email === process.env.TEST2_EMAIL) {
        token = process.env.TEST2_DUMMY_AUTH_TOKEN ?? ''
      } else {
        throw new Error('Invalid credentials')
      }

      res.json({ success: true, mesaage: 'Login successful', token })
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
