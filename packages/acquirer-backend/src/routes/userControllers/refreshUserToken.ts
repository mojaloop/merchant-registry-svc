/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { type AuthRequest } from 'src/types/express'
import path from 'path'
import dotenv from 'dotenv'
import { AuditActionType, AuditTransactionStatus } from 'shared-lib'
import { audit } from '../../utils/audit'
import jwt from 'jsonwebtoken'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true })
}

const JWT_SECRET = process.env.JWT_SECRET ?? ''
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1d'
/**
 * @openapi
 * /users/refresh:
 *   post:
 *     tags:
 *       - Portal Users
 *     security:
 *       - Authorization: []
 *     summary: Refresh User Token
 *     responses:
 *       200:
 *         description: Refresh Token
 */

export async function postUserRefresh (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }
  const token = jwt.sign(
    { id: portalUser.id, email: portalUser.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  await audit(
    AuditActionType.ACCESS,
    AuditTransactionStatus.SUCCESS,
    'postUserRefresh',
    'Get Portal User Profile',
    'PortalUserEntity',
    {}, {}, portalUser
  )

  res.send({ message: 'Refresh Token', token })
}
