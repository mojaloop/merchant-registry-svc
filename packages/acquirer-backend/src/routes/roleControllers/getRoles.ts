/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import logger from '../../services/logger'
import { type AuthRequest } from 'src/types/express'
import { PortalRoleEntity } from '../../entity/PortalRoleEntity'
import { PortalPermissionEntity } from '../../entity/PortalPermissionEntity'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'

/**
 * @openapi
 * tags:
 *   name: Roles
 *
 * /roles:
 *   get:
 *     tags:
 *       - Roles
 *     security:
 *       - Authorization: []
 *     summary: GET Roles
 *     responses:
 *       200:
 *         description: GET Roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The response message
 *                   example: OK
 *                 data:
 *                   type: array
 *                   description: The list of roles with their permissions and users
 *                   items:
 *                     type: object
 */
export async function getRoles (req: AuthRequest, res: Response) {
  const portalUser = req.user
  /* istanbul ignore next */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    logger.debug('req.query: %o', req.query)

    const RoleRepository = AppDataSource.getRepository(PortalRoleEntity)
    const PermsRepository = AppDataSource.getRepository(PortalPermissionEntity)

    const roles = await RoleRepository.find(
      { where: {}, relations: ['permissions'] }
    )

    const permissions = await PermsRepository.find()

    /* eslint-disable-next-line */
    const flattenedRoles = roles.map(({ created_at, updated_at, ...role }) => ({
      ...role,
      permissions: role.permissions.map(permission => permission.name)
    }))

    const flattenedPermissions = permissions.map(permission => permission.name)

    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.SUCCESS,
      'getRoles',
      'GET List of Roles and associated permissions',
      'PortalRoleEntity',
      {}, {}, portalUser)

    res.send({ message: 'OK', data: flattenedRoles, permissions: flattenedPermissions })
  } catch (e) /* istanbul ignore next */ {
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
