import { type Request, type Response } from 'express'
import logger from '../../services/logger'
import { audit } from '../../utils/audit'
import { AppDataSource } from '../../database/data-source'
import {
  AuditActionType,
  AuditTrasactionStatus
} from 'shared-lib'
import { hashPassword } from '../../utils/utils'

/**
 * @openapi
 * /users/reset-password:
 *   put:
 *     tags:
 *       - Portal Users
 *     summary: Reset Password
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: "password"
 *     responses:
 *       200:
 *         description: Reset Password Successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reset Password Successful"
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *
 */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export async function putUserResetPassword (req: Request, res: Response) {
  const portalUser = req.user
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const { password } = req.body

  try {
    const oldPasswordHash = portalUser.password
    portalUser.password = await hashPassword(password)
    await AppDataSource.manager.save(portalUser)

    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.SUCCESS,
      'putUserResetPassword',
      'Reset User Password Successful',
      'PortalUserEntity',
      { password: oldPasswordHash }, { password: portalUser.password }, null
    )

    return res.status(201).send({ message: 'Reset Password Successful' })
  } catch (error) {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'putUserResetPassword',
      'Reset User Password Failed',
      'PortalUserEntity',
      {}, {}, null
    )

    logger.error('%o', error)
    return res
      .status(500)
      .send({ message: error })
  }
}
