/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { type AuthRequest } from 'src/types/express'
import { AppDataSource } from '../../database/dataSource'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { audit } from '../../utils/audit'
import { JwtTokenEntity } from '../../entity/JwtTokenEntity'

/**
 * @openapi
 * tags:
 *   name: Portal Users
 *
 * /users/logout:
 *   post:
 *     tags:
 *       - Portal Users
 *     security:
 *       - Authorization: []
 *     summary: Logout
 *     responses:
 *       200:
 *         description: Logout Successful
 */

export async function postUserLogout (req: AuthRequest, res: Response) {
  const portalUser = req.user

  /* istanbul ignore if */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  await AppDataSource.manager.delete(JwtTokenEntity, {
    user: portalUser,
    token: req.token
  })

  await audit(
    AuditActionType.ACCESS,
    AuditTrasactionStatus.SUCCESS,
    'postUserLogout',
    'Logout Successful',
    'PortalUserEntity',
    {}, {}, portalUser
  )

  res.send({ message: 'Logout Successful' })
}
