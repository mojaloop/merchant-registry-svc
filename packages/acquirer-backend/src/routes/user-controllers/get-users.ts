/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { type AuthRequest } from 'src/types/express'
import { AppDataSource } from '../../database/data-source'
import { PortalUserEntity } from '../../entity/PortalUserEntity'

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

export async function getUsers (req: AuthRequest, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const users = await AppDataSource.manager.find(PortalUserEntity, {
    relations: ['role', 'role.permissions']
  })

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
  res.send({ message: 'List of users', data: flattenedUsers })
}
