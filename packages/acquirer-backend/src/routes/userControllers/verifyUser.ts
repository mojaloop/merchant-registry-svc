/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { type AuthRequest } from 'src/types/express'
import { type IJWTUser } from 'src/types/jwtUser'
import jwt from 'jsonwebtoken'
import logger from '../../services/logger'
import { EmailVerificationTokenEntity } from '../../entity/EmailVerificationToken'
import { AppDataSource } from '../../database/dataSource'
import { PortalUserEntity } from '../../entity/PortalUserEntity'
import { PortalUserStatus } from 'shared-lib'

const JWT_SECRET = process.env.JWT_SECRET ?? ''
const FRONTEND_SET_PASSWORD_URL = process.env.FRONTEND_SET_PASSWORD_URL ?? ''

/**
 * @openapi
 * /users/verify:
 *   get:
 *     tags:
 *       - Portal Users
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: The token to verify the user email
 *     summary: Verify The Email Token and Redirect to Frontend To set password
 */

export async function verifyUserEmail (req: AuthRequest, res: Response) {
  const token = req.query.token as string | undefined

  if (token === undefined) {
    return res.status(422).send({ message: 'Token is empty' })
  }

  logger.debug(`Verifying user email with token: ${token}`)

  const PortalUserRepository = AppDataSource.getRepository(PortalUserEntity)
  const EmailVerificationTokenRepository = AppDataSource.getRepository(EmailVerificationTokenEntity)

  const decodedJwt = jwt.verify(token, JWT_SECRET) as IJWTUser
  logger.debug(`Decoded JWT: ${JSON.stringify(decodedJwt)}`)
  if (decodedJwt == null) {
    return res.status(401).send({ message: 'JWT Invalid' })
  }

  const emailVerificationToken = await EmailVerificationTokenRepository.findOne({
    where: { token }
  })
  logger.debug('Email Verification Token: %o', emailVerificationToken)

  if (emailVerificationToken == null) {
    return res.status(404).send({ message: 'Token not found' })
  }

  if (emailVerificationToken.is_used) {
    return res.status(404).send({ message: 'Token already used' })
  }

  const user = await PortalUserRepository.findOne({
    where: { email: emailVerificationToken.email }
  })

  if (user == null) {
    return res.status(404).send({ message: 'User not found' })
  }

  emailVerificationToken.is_used = true
  user.status = PortalUserStatus.RESETPASSWORD

  try {
    await EmailVerificationTokenRepository.save(emailVerificationToken)
    await PortalUserRepository.save(user)
  } catch (err) {
    logger.error('%o', err)
    return res.status(500).send({ message: 'Internal Server Error', error: err })
  }

  const newToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' })

  logger.debug('Redirecting to frontend %o', FRONTEND_SET_PASSWORD_URL)
  res.redirect(`${FRONTEND_SET_PASSWORD_URL}?token=${newToken}`)
}
