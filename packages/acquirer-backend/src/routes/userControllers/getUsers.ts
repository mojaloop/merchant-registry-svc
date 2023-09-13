/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { type AuthRequest } from 'src/types/express'
import { AppDataSource } from '../../database/dataSource'
import { PortalUserEntity } from '../../entity/PortalUserEntity'
import { AuditActionType, AuditTrasactionStatus, PortalUserType } from 'shared-lib'
import { audit } from '../../utils/audit'

/**
 * @openapi
 * tags:
 *   name: Portal Users
 *
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

export async function getUsers (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  let users = await AppDataSource.manager.find(PortalUserEntity, {
    relations: ['role', 'role.permissions', 'dfsp']
  })

  // DFSPs can only see their own users
  if (portalUser.user_type === PortalUserType.DFSP) {
    users = users.filter(user => user.dfsp.id === portalUser.dfsp.id)
  }

  const flattenedUsers = users.map(user => {
    return {
      ...user,
      role: {
        ...user.role,
        created_at: undefined,
        updated_at: undefined,
        permissions: user.role.permissions.map(permission => permission.name)
      },
      password: undefined
    }
  })

  await audit(
    AuditActionType.ACCESS,
    AuditTrasactionStatus.SUCCESS,
    'getUsers',
    'Get a list of users',
    'PortalUserEntity',
    {}, {}, portalUser
  )

  res.send({ message: 'List of users', data: flattenedUsers })
}
