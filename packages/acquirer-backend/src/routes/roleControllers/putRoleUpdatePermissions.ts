/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import logger from '../../services/logger'
import { type AuthRequest } from 'src/types/express'
import { PortalRoleEntity } from '../../entity/PortalRoleEntity'
import { PortalPermissionEntity } from '../../entity/PortalPermissionEntity'
import { In } from 'typeorm'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { audit } from '../../utils/audit'
import { isUndefinedOrNull } from '../../utils/utils'
/**
 * @openapi
 * /roles/{id}:
 *   post:
 *     tags:
 *       - Roles
 *     security:
 *       - Authorization: []
 *     summary: Update Permissions for Role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: ["VIEW_MERCHANTS", "REJECT_MERCHANTS"]
 *                   description: "The permissions for the role"
 *     responses:
 *       200:
 *         description: Role Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The response message
 *                   example: OK
 */
export async function putRoleUpdatePermissions (req: AuthRequest, res: Response) {
  const portalUser = req.user
  /* istanbul ignore if */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const RoleRepository = AppDataSource.getRepository(PortalRoleEntity)
  const PermsRepository = AppDataSource.getRepository(PortalPermissionEntity)

  const { permissions } = req.body

  const id = Number(req.params.id)
  if (isNaN(id) || id < 1) {
    logger.error('Invalid ID')
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'putRoleUpdatePermissions',
        `Invalid ID: ${req.params.id}`,
        'PortalRoleEntity',
        {}, {}, portalUser
    )
    res.status(422).send({ message: 'Invalid ID' })
    return
  }

  if (isUndefinedOrNull(permissions)) {
    await audit(AuditActionType.ADD, AuditTrasactionStatus.FAILURE,
      'putRoleUpdatePermissions',
      'Missing permissions field',
      'PortalRoleEntity',
      {}, { body: req.body }, portalUser
    )
    return res.status(400).send({ message: 'Missing permissions field' })
  }
  // check if role exist
  const role = await RoleRepository.findOne({ where: { id } })
  if (role == null) {
    await audit(AuditActionType.UPDATE, AuditTrasactionStatus.FAILURE,
      'putRoleUpdatePermissions',
      'Role does not exist',
      'PortalRoleEntity',
      {}, { id }, portalUser)

    return res.status(404).send({ message: 'Role does not exist' })
  }

  // check if permissions exist
  const perms = await PermsRepository.find({ where: { name: In(permissions) } })
  if (perms.length !== permissions.length) {
    await audit(AuditActionType.UPDATE, AuditTrasactionStatus.FAILURE,
      'putRoleUpdatePermissions',
      'Invalid permissions. At least one of the permissions does not exist',
      'PortalRoleEntity',
      {}, { permissions }, portalUser)

    return res.status(400).send({ message: 'Invalid permissions. At least one of the permissions does not exist' })
  }

  try {
    role.permissions = perms
    await RoleRepository.save(role)

    await audit(AuditActionType.UPDATE, AuditTrasactionStatus.SUCCESS,
      'putRoleUpdatePermissions',
      'Role updated successfully',
      'PortalRoleEntity',
      {}, { role }, portalUser)

    return res.send({ message: 'Role updated successfully' })
  } catch (e) /* istanbul ignore next */ {
    logger.error(e)
    res.status(500).send({ message: e })
  }
}
