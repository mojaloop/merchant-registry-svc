/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/data-source'
import logger from '../../services/logger'
import { type AuthRequest } from 'src/types/express'
import { PortalRoleEntity } from '../../entity/PortalRoleEntity'

/**
 * @openapi
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
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    logger.debug('req.query: %o', req.query)

    const RoleRepository = AppDataSource.getRepository(PortalRoleEntity)

    const roles = RoleRepository.find(
      { where: {}, relations: ['permissions'] }
    )

    res.send({ message: 'OK', data: roles })
  } catch (e) {
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
