/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { type AuthRequest } from 'src/types/express'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { audit } from '../../utils/audit'

/**
 * @openapi
 * /users/profile:
 *   get:
 *     tags:
 *       - Portal Users
 *     security:
 *       - Authorization: []
 *     summary: GET Portal User Profile
 *     responses:
 *       200:
 *         description: GET Portal User Profile
 */

export async function getUserProfile (req: AuthRequest, res: Response) {
  const portalUser = req.user
  /* istanbul ignore if */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }
  const user =
     {
       ...portalUser,
       role: {
         ...portalUser.role,
         permissions: portalUser.role != null
           ? portalUser.role.permissions.map(permission => permission.name)
           : []
       },
       password: undefined
     }

  await audit(
    AuditActionType.ACCESS,
    AuditTrasactionStatus.SUCCESS,
    'getUserProfile',
    'Get Portal User Profile',
    'PortalUserEntity',
    {}, {}, portalUser
  )

  res.send({ message: 'GET Portal User Profile', data: user })
}
