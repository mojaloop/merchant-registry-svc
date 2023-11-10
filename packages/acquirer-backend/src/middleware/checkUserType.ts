import { type Response, type NextFunction } from 'express'
import { type PortalUserType } from 'shared-lib'
import { type PortalUserEntity } from 'src/entity/PortalUserEntity'
import { type AuthRequest } from 'src/types/express'

export const checkUserUserType = (requiredUserType: PortalUserType) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user as PortalUserEntity

    if (user.user_type !== requiredUserType) {
      return res.status(403).send({ message: `Forbidden. ${user.user_type} User is not allowed.` })
    }

    next()
  }
}
