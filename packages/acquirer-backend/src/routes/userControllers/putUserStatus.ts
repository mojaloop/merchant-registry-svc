import { type Response } from 'express'
import logger from '../../services/logger'
import { audit } from '../../utils/audit'
import { AppDataSource } from '../../database/dataSource'
import { AuditActionType, AuditTrasactionStatus, PortalUserStatus } from 'shared-lib'
import { type AuthRequest } from '../../types/express'
import { PortalUserEntity } from '../../entity/PortalUserEntity'

/**
 * @openapi
 * /users/{user_id}/status:
 *   put:
 *     tags:
 *       - Portal Users
 *     summary: Update User Status
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - Active
 *                   - Inactive
 *                   - Blocked
 *                   - Disabled
 *     responses:
 *       200:
 *         description: Update User Status Successful
 */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export async function putUserStatus (req: AuthRequest, res: Response) {
  const portalUser = req.user

  /* istanbul ignore if  */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const { status } = req.body
  const userId = Number(req.params.user_id)

  if (isNaN(userId)) {
    logger.error('Invalid ID')
    res.status(422).send({ message: 'Invalid ID' })
    return
  }

  const user = await AppDataSource.manager.findOne(PortalUserEntity, {
    where: { id: userId }
  })

  if (user === null) {
    logger.error('User not found')
    res.status(404).send({ message: 'User Not Found' })
    return
  }

  if (!Object.values(PortalUserStatus).includes(status)) {
    logger.error('Invalid Status')
    res.status(422).send({ message: 'Invalid Status' })
    return
  }

  if (portalUser.id === userId) {
    logger.error('Cannot change own status')
    res.status(422).send({ message: 'Cannot change own status' })
    return
  }

  if (user.status === status) {
    logger.error('Status already set')
    res.status(422).send({ message: 'Status already set' })
    return
  }

  try {
    user.status = status
    await AppDataSource.manager.save(user)
  } catch (error) {
    logger.error('%o', error)
    return res.status(500).send({ message: error })
  }

  await audit(
    AuditActionType.UPDATE,
    AuditTrasactionStatus.SUCCESS,
    'putUserStatus',
    'Update User Status Successful',
    'PortalUserEntity',
    { status: user.status },
    { status },
    null
  )

  return res.status(200).send({ message: 'Update User Status Successful' })
}
