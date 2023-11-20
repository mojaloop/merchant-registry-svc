import path from 'path'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { type Request, type Response, type NextFunction } from 'express'
import { audit } from '../utils/audit'
import { AppDataSource } from '../database/dataSource'
import { PortalUserEntity } from '../entity/PortalUserEntity'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { type IJWTUser } from 'src/types/jwtUser'
import { isUndefinedOrNull } from '../utils/utils'
import { JwtTokenEntity } from '../entity/JwtTokenEntity'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true })
}

export const JWT_SECRET = process.env.JWT_SECRET ?? ''

/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
export async function authenticateJWT (req: Request, res: Response, next: NextFunction) {
  const authorization = req.header('Authorization')

  if (isUndefinedOrNull(authorization)) {
    await audit(
      AuditActionType.UNAUTHORIZED_ACCESS,
      AuditTrasactionStatus.FAILURE,
      'authenticateJWT',
      'Authorization header is undefined',
      'PortalUserEntity',
      {}, {}, null
    )
    return res.status(401).send({ message: 'Authorization Failed' })
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const token = authorization!.replace('Bearer', '').trim()

  try {
    const jwtTokenRecord = await AppDataSource.manager.findOne(JwtTokenEntity, {
      where: { token },
      relations: ['user', 'user.role', 'user.role.permissions', 'user.dfsp']
    })

    if (jwtTokenRecord == null) {
      throw new Error('JWT Token Not Found!')
    }

    jwt.verify(token, JWT_SECRET)

    req.user = jwtTokenRecord.user
    req.token = token

    await AppDataSource.manager.update(JwtTokenEntity, { token }, { last_used: new Date() })
    next()
  } catch (err) {
    await audit(
      AuditActionType.UNAUTHORIZED_ACCESS,
      AuditTrasactionStatus.FAILURE,
      'authenticateJWT',
      'Invalid token',
      'PortalUserEntity',
      {}, { token }, null
    )
    res.status(401).send({ message: 'Authorization Failed', error: err })
  }
}
