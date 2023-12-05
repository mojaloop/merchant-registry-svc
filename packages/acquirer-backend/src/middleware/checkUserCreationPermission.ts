import { type Response, type NextFunction } from 'express'
import { type AuthRequest } from '../types/express'
import { PermissionsEnum } from '../types/permissions'
import { audit } from '../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'

export function checkUserCreationPermission () {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const portalUser = req.user
    const roleToCreate = req.body.role

    if (portalUser == null || portalUser === undefined) {
      return res.status(401).send({ message: 'Unauthorized' })
    }

    const roleCreationPermissions: any = {
      'Hub Super Admin': PermissionsEnum.CREATE_HUB_SUPER_ADMIN,
      'Hub Admin': PermissionsEnum.CREATE_HUB_ADMIN,

      'DFSP Admin': PermissionsEnum.CREATE_DFSP_ADMIN,
      'DFSP Operator': PermissionsEnum.CREATE_DFSP_OPERATOR,
      'DFSP Auditor': PermissionsEnum.CREATE_DFSP_AUDITOR
    }

    const requiredPermission = roleCreationPermissions[roleToCreate]

    if (requiredPermission === undefined) {
      await audit(AuditActionType.ADD,
        AuditTrasactionStatus.FAILURE,
        'checkRoleCreationPermission',
        `Invalid role to create user account: ${roleToCreate}`,
        'PortalUserEntity',
        {}, {}, portalUser
      )
      return res.status(400).send({ message: 'Invalid role' })
    }

    try {
      const portalUserPermissionsList = portalUser.role.permissions.map(permission => permission.name)
      if (!portalUserPermissionsList.includes(requiredPermission)) {
        await audit(AuditActionType.ADD,
          AuditTrasactionStatus.FAILURE,
          'checkRoleCreationPermission',
        `User ${portalUser.email} has no insufficient permissions to create this role.`,
        'PortalUserEntity',
        {}, {}, portalUser
        )
        return res.status(403).send({ message: 'Insufficient permissions to create this role.' })
      }

      // User has required permissions... continue
      next()
    } catch (error) {
      console.error(error)
      res.status(500).send({ message: 'Internal server error' })
    }
  }
}
