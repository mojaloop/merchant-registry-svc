import { type Response, type NextFunction } from 'express'
import { type PortalUserEntity } from 'src/entity/PortalUserEntity'
import { type AuthRequest } from 'src/types/express'
import { PermissionsEnum } from '../types/permissions'

export const checkPermissions = (requiredPermission: PermissionsEnum) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user as PortalUserEntity

    if (user?.role?.permissions == null) {
      return res.status(403).send({ message: 'Forbidden' })
    }

    const hasPermission = user.role.permissions.some(
      (permission) => permission.name === requiredPermission
    )

    if (!hasPermission) {
      if (requiredPermission === PermissionsEnum.EDIT_ROLES) {
        console.log('checkPermissions: user.role.permissions: ', user.role.permissions)
        console.log('user:', user)
      }
      return res.status(403).json({
        message:
        `Forbidden. '${requiredPermission}' permission is required.`
      })
    }

    next()
  }
}

export const checkPermissionsOr = (requiredPermissions: PermissionsEnum[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user as PortalUserEntity

    if (user?.role?.permissions == null) {
      return res.status(403).send({ message: 'Forbidden' })
    }

    const hasPermission = user.role.permissions.some(permission =>
      requiredPermissions.includes(permission.name as PermissionsEnum)
    )

    if (!hasPermission) {
      return res.status(403).json({
        message:
`Forbidden. One of the following permissions is required: ${requiredPermissions.join(', ')}.`
      })
    }

    next()
  }
}
