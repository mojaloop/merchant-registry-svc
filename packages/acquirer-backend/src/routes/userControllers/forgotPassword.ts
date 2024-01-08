import { type Response } from 'express'
import jwt from 'jsonwebtoken'
import ms from 'ms'
import logger from '../../services/logger'
import { audit } from '../../utils/audit'
import { AppDataSource } from '../../database/dataSource'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { type AuthRequest } from '../../types/express'
import { PortalUserEntity } from '../../entity/PortalUserEntity'
import { readEnv } from '../../setup/readEnv'
import { sendForgotPasswordEmail } from '../../utils/sendGrid'
import { JwtTokenEntity } from '../../entity/JwtTokenEntity'
import { EmailVerificationTokenEntity } from '../../entity/EmailVerificationToken'

const JWT_SECRET = readEnv('JWT_SECRET', 'secret') as string

/**
 * @openapi
 * /users/forgot-password:
 *   post:
 *     tags:
 *       - Portal Users
 *     summary: Reset Forgot Password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: email
 *                 example: "user@email.com"
 *     responses:
 *       200:
 *         description: Reset Password Link Sent Successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reset Password Link Sent Successful"
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
export async function postUserForgotPassword (req: AuthRequest, res: Response) {
  const { email } = req.body

  try {
    const forgottenPwdUser = await AppDataSource.manager.findOne(PortalUserEntity, {
      where: { email },
      relations: ['role']
    })
    if (forgottenPwdUser == null) {
      return res.status(404).send({ message: 'Email Not Found' })
    }

    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(forgottenPwdUser)
      // Generate Token using jwt
      const token = jwt.sign({ id: forgottenPwdUser.id, email: forgottenPwdUser.email }, JWT_SECRET, { expiresIn: '1h' })

      const jwtTokenObj = transactionalEntityManager.create(JwtTokenEntity, {
        token,
        user: forgottenPwdUser,
        expires_at: new Date(Date.now() + ms('1h')),
        last_used: new Date()
      })

      await transactionalEntityManager.save(jwtTokenObj)
      await transactionalEntityManager.save(EmailVerificationTokenEntity, {
        user: forgottenPwdUser,
        token,
        email: forgottenPwdUser.email
      })

      // Send Email with token
      await sendForgotPasswordEmail(forgottenPwdUser.email, token)
    })

    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.SUCCESS,
      'postUserForgotPassword',
      'Forgot Password Successful',
      'PortalUserEntity',
      {},
      { email },
      null
    )

    return res.status(201).send({ message: 'Reset Password Link Sent Successful' })
  } catch (error: any) /* istanbul ignore next */ {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'postUserForgotPassword',
      'Forgot Password Failed',
      'PortalUserEntity',
      {},
      { email },
      null
    )

    logger.error('%s', error.message)
    return res.status(500).send({ message: error.message })
  }
}
