/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { type AuthRequest } from 'src/types/express'

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
         permissions: portalUser.role.permissions.map(permission => permission.name)
       },
       password: undefined
     }

  res.send({ message: 'GET Portal User Profile', data: user })
}
