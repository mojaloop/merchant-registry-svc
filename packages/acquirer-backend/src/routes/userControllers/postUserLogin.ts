import path from 'path'
import bcrypt from 'bcrypt'
import { type Request, type Response } from 'express'
import * as z from 'zod'
import dotenv from 'dotenv'
import { AppDataSource } from '../../database/dataSource'
import { PortalUserEntity } from '../../entity/PortalUserEntity'
import logger from '../../services/logger'
import jwt from 'jsonwebtoken'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus, PortalUserStatus } from 'shared-lib'
import { readEnv } from '../../setup/readEnv'

export const LoginFormSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8)
})

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true })
}

const JWT_SECRET = readEnv('JWT_SECRET', 'secret') as string
const JWT_EXPIRES_IN = readEnv('JWT_EXPIRES_IN', '1d') as string

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
 *                 example: "d1superadmin1@email.com"
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
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export async function postUserLogin (req: Request, res: Response) {
  try {
    LoginFormSchema.parse(req.body)
  } catch (err) {
    if (err instanceof z.ZodError) {
      logger.debug('Validation error: %o', err)
      return res.status(422).send({ message: 'Validation error' })
    }
  }

  try {
    const user = await AppDataSource.manager.findOne(
      PortalUserEntity,
      {
        where: { email: req.body.email }
      }
    )
    logger.info('User %s login attempt.', req.body.email)

    if (user == null) {
      throw new Error('Invalid credentials')
    }

    if (user.status === PortalUserStatus.UNVERIFIED) {
      throw new Error('User is not verified')
    }

    if (user.status === PortalUserStatus.RESETPASSWORD) {
      throw new Error('User need to reset password')
    }

    const passwordMatch = await bcrypt.compare(req.body.password, user.password)
    if (!passwordMatch) {
      throw new Error('Invalid credentials')
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
    logger.info('User %s logged in successfully.', user.email)
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.SUCCESS,
      'postUserLogin',
      'User login successful',
      'PortalUserEntity',
      {}, {}, user
    )

    res.json({ success: true, message: 'Login successful', token })
  } catch (error: any)/* istanbul ignore next */ {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'postUserLogin',
      'User login failed',
      'PortalUserEntity',
      {}, { error: error.message }, null
    )

    logger.error('User %s login failed: %o', req.body.email, error)
    res
      .status(400)
      .send({ success: false, message: error.message })
  }
}
