/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import logger from '../../services/logger'
import { type AuthRequest } from 'src/types/express'
import { PortalRoleEntity } from '../../entity/PortalRoleEntity'
import { PortalPermissionEntity } from '../../entity/PortalPermissionEntity'
import { In } from 'typeorm'
import { isUndefinedOrNull } from '../../utils/utils'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
/**
 * @openapi
 * /roles:
 *   post:
 *     tags:
 *       - Roles
 *     security:
 *       - Authorization: []
 *     summary: POST Role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "DFSP Operator"
 *                 description: "The name of the role"
 *               description:
 *                 type: string
 *                 example: "DFSP Operator"
 *                 description: "The description of the role"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "View Merchants"
 *                   description: "The permissions for the role"
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The response message
 *                   example: Role created successfully
 *
 */
export async function postCreateRole (req: AuthRequest, res: Response) {
  const portalUser = req.user
  /* istanbul ignore if */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const RoleRepository = AppDataSource.getRepository(PortalRoleEntity)
    const PermsRepository = AppDataSource.getRepository(PortalPermissionEntity)

    const { name, description, permissions } = req.body
    if (isUndefinedOrNull(name)) {
      await audit(AuditActionType.ADD, AuditTrasactionStatus.FAILURE,
        'postCreateRole',
        'Missing name field',
        'PortalRoleEntity',
        {}, { body: req.body }, portalUser
      )
      return res.status(400).send({ message: 'Missing name field' })
    }

    if (isUndefinedOrNull(description)) {
      await audit(AuditActionType.ADD, AuditTrasactionStatus.FAILURE,
        'postCreateRole',
        'Missing description field',
        'PortalRoleEntity',
        {}, { body: req.body }, portalUser
      )
      return res.status(400).send({ message: 'Missing description field' })
    }

    if (isUndefinedOrNull(permissions)) {
      await audit(AuditActionType.ADD, AuditTrasactionStatus.FAILURE,
        'postCreateRole',
        'Missing permissions field',
        'PortalRoleEntity',
        {}, { body: req.body }, portalUser
      )
      return res.status(400).send({ message: 'Missing permissions field' })
    }

    // check if permissions exist
    const perms = await PermsRepository.find({ where: { name: In(permissions) } })
    logger.debug('Permissions: %o', perms)

    if (perms.length !== permissions.length) {
      await audit(AuditActionType.ADD, AuditTrasactionStatus.FAILURE,
        'postCreateRole',
        'Invalid permissions',
        'PortalRoleEntity',
        {}, { permissions }, portalUser)
      return res.status(400).send({ message: 'Invalid permissions' })
    }

    // check if role exists
    const role = await RoleRepository.findOne({ where: { name } })
    if (role != null) {
      await audit(AuditActionType.ADD, AuditTrasactionStatus.FAILURE,
        'postCreateRole',
        'Role already exists',
        'PortalRoleEntity',
        {}, { role_name: name }, portalUser)
      return res.status(400).send({ message: 'Role already exists' })
    }

    const newRole = new PortalRoleEntity()
    newRole.name = name
    newRole.description = description
    newRole.permissions = perms
    await RoleRepository.save(newRole)

    await audit(AuditActionType.ADD, AuditTrasactionStatus.SUCCESS,
      'postCreateRole',
      'Role created successfully',
      'PortalRoleEntity',
      {}, { role: newRole }, portalUser)

    return res.status(201).send({ message: 'Role created successfully' })
  } catch (e) /* istanbul ignore next */ {
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
