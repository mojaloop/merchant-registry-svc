import { type Response, type NextFunction } from 'express'
import { type PortalUserEntity } from 'src/entity/PortalUserEntity'
import { type AuthRequest } from 'src/types/express'
import { type PermissionsEnum } from 'src/types/permissions'

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
      return res.status(403).json({
        message:
        `Forbidden. '${requiredPermission}' permission is required.`
      })
    }

    next()
  }
}
