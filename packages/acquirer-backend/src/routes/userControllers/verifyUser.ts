/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'
import { Not } from 'typeorm'
import logger from '../../services/logger'
import { EmailVerificationTokenEntity } from '../../entity/EmailVerificationToken'
import { AppDataSource } from '../../database/dataSource'
import { PortalUserEntity } from '../../entity/PortalUserEntity'
import { PortalUserStatus } from 'shared-lib'
import { readEnv } from '../../setup/readEnv'
import { type IJWTUser } from '../../types/jwtUser'
import { DefaultHubSuperAdmin } from '../../database/defaultUsers'
import { JwtTokenEntity } from '../../entity/JwtTokenEntity'
import { ApplicationStateEntity } from '../../entity/ApplicationStateEntity'

const JWT_SECRET = readEnv('JWT_SECRET', 'secret') as string
const FRONTEND_SET_PASSWORD_URL = readEnv('FRONTEND_SET_PASSWORD_URL', '') as string

/**
 * @openapi
 * /users/verify:
 *   get:
 *     tags:
 *       - Portal Users
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: The token to verify the user email
 *     summary: Verify The Email Token and Redirect to Frontend To set password
 */

export async function verifyUserEmail (req: Request, res: Response) {
  const token = req.query.token as string | undefined

  if (token === undefined) {
    return res.status(422).send({ message: 'Token is empty' })
  }

  logger.debug(`Verifying user email with token: ${token}`)

  const PortalUserRepository = AppDataSource.getRepository(PortalUserEntity)
  const EmailVerificationTokenRepository = AppDataSource.getRepository(EmailVerificationTokenEntity)

  let decodedJwt
  try {
    decodedJwt = jwt.verify(token, JWT_SECRET) as IJWTUser
    logger.debug(`Decoded JWT: ${JSON.stringify(decodedJwt)}`)
  } catch (error) {
    // If an error occurs, it is likely due to an invalid token
    logger.error('JWT verification error: ', error)
    return res.status(401).send({ message: 'JWT Invalid' })
  }

  const emailVerificationToken = await EmailVerificationTokenRepository.findOne({
    where: { token }
  })
  logger.debug('Email Verification Token: %o', emailVerificationToken)

  if (emailVerificationToken == null) {
    return res.status(404).send({ message: 'Token not found' })
  }

  const user = await PortalUserRepository.findOne({
    where: { email: emailVerificationToken.email },
    relations: ['created_by']
  })

  if (user == null) {
    return res.status(404).send({ message: 'User not found' })
  }

  emailVerificationToken.is_used = true
  user.status = PortalUserStatus.RESETPASSWORD

  try {
    await EmailVerificationTokenRepository.save(emailVerificationToken)
    await PortalUserRepository.save(user)

    // Handle Hub Onboarding Flow
    if (user.created_by?.email === DefaultHubSuperAdmin.email) {
      const userCountCreatedByHubSuperAdmin = await PortalUserRepository.count({
        where: { created_by: { id: user.created_by.id }, status: Not(PortalUserStatus.UNVERIFIED) }
      })

      if (userCountCreatedByHubSuperAdmin >= 3) {
        //
        // Remove all login tokens of the Hub Super Admin
        // And Disable the Hub Super Admin
        //
        const tokens = await AppDataSource.getRepository(JwtTokenEntity).find({
          where: { user: { id: user.created_by.id } }
        })

        const tokenRepository = AppDataSource.getRepository(JwtTokenEntity)
        for (const token of tokens) {
          await tokenRepository.remove(token)
        }

        await PortalUserRepository.update({ id: user.created_by.id }, { status: PortalUserStatus.DISABLED })
        await AppDataSource.manager.update(ApplicationStateEntity, {}, { is_hub_onboarding_complete: true })
      }
    }
  } catch (err) /* istanbul ignore next */ {
    logger.error('%o', err)
    return res.status(500).send({ message: 'Internal Server Error', error: err })
  }

  logger.debug('Redirecting to frontend %o', FRONTEND_SET_PASSWORD_URL)
  res.redirect(`${FRONTEND_SET_PASSWORD_URL}?token=${token}`)
}
