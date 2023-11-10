import { type Response } from 'express'
import logger from '../../services/logger'
import { audit } from '../../utils/audit'
import jwt from 'jsonwebtoken'
import { PortalUserEntity } from '../../entity/PortalUserEntity'
import { AppDataSource } from '../../database/dataSource'
import { PortalRoleEntity } from '../../entity/PortalRoleEntity'
import * as z from 'zod'
import {
  AuditActionType,
  AuditTrasactionStatus,
  PortalUserStatus,
  PortalUserType
} from 'shared-lib'
import { EmailVerificationTokenEntity } from '../../entity/EmailVerificationToken'
import { sendVerificationEmail } from '../../utils/sendGrid'
import { DFSPEntity } from '../../entity/DFSPEntity'
import { type AuthRequest } from '../../types/express'
import { readEnv } from '../../setup/readEnv'

const AddUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  dfsp_id: z.number().optional()
})

const JWT_SECRET = readEnv('JWT_SECRET', '') as string

/**
 * @openapi
 * /users/add:
 *   post:
 *     tags:
 *       - Portal Users
 *     summary: Add a user by Admin
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Test User"
 *                 description: "The name of the user"
 *               email:
 *                 type: string
 *                 example: "test1@email.com"
 *                 description: "The email for login"
 *               role:
 *                 type: string
 *                 example: "Auditor"
 *                 description: "The role of the user"
 *               dfsp_id:
 *                 type: number
 *                 example: 5
 *                 description: "The dfsp database id"
 *                 required: false
 *                 nullable: true
 *     responses:
 *       200:
 *         description: User created. And Verification Email Sent
 *       422:
 *         description: Validation error
 *       400:
 *         description: Invalid credentials
 */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export async function addUser (req: AuthRequest, res: Response) {
  const portalUser = req.user

  /* istanbul ignore if */
  if (portalUser == null) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const result = AddUserSchema.safeParse(req.body)
  if (!result.success) {
    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.FAILURE,
      'addUser',
      'User Creation failed',
      'PortalUserEntity',
      {}, { error: result.error.flatten() }, null
    )
    return res.status(422).send({ message: 'Validation error', errors: result.error.flatten() })
  }

  try {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { name, email, role, dfsp_id } = req.body
    logger.debug('addUser req.body: %s', JSON.stringify(req.body))
    const roleRepository = AppDataSource.getRepository(PortalRoleEntity)

    const roleObj = await roleRepository.findOne({ where: { name: role } })
    if (roleObj == null) {
      await audit(
        AuditActionType.ADD,
        AuditTrasactionStatus.FAILURE,
        'addUser',
        'User Creation failed',
        'PortalUserEntity',
        {}, {}, null
      )
      return res.status(400).send({ message: 'Invalid role' })
    }

    // check if email exists
    const existsEmail = await AppDataSource.manager.exists(
      PortalUserEntity,
      { where: { email } }
    )
    if (existsEmail) {
      await audit(
        AuditActionType.ADD,
        AuditTrasactionStatus.FAILURE,
        'addUser',
        'User Creation failed',
        'PortalUserEntity',
        {}, {}, null
      )
      return res.status(400).send({ message: 'Email already exists' })
    }

    const newUser = new PortalUserEntity()
    newUser.name = name
    newUser.email = email
    newUser.user_type = PortalUserType.DFSP
    newUser.status = PortalUserStatus.UNVERIFIED
    newUser.role = roleObj
    if (portalUser.user_type === PortalUserType.HUB) {
      const dfsp = await AppDataSource.manager.findOne(DFSPEntity, {
        where: { id: dfsp_id }
      })
      if (dfsp == null) {
        await audit(
          AuditActionType.ADD,
          AuditTrasactionStatus.FAILURE,
          'addUser',
          'User Creation failed: Invalid DFSP dfsp_id Not found',
          'PortalUserEntity',
          {}, {}, null
        )
        return res.status(400).send({ message: 'Invalid dfsp_id: DFSP Not found' })
      }
      newUser.dfsp = dfsp
    } else {
      newUser.dfsp = portalUser.dfsp
    }
    await AppDataSource.manager.save(newUser)

    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.SUCCESS,
      'addUser',
      'User Created',
      'PortalUserEntity',
      {}, { ...newUser }, null
    )

    // Generate Token using jwt
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET, { expiresIn: '1y' })

    await AppDataSource.manager.save(EmailVerificationTokenEntity, {
      user: newUser,
      token,
      email: newUser.email
    })

    // Send Email with token
    await sendVerificationEmail(newUser.email, token, roleObj.name)

    res.status(201).send({ message: 'User created. And Verification Email Sent', data: newUser })
  } catch (error) /* istanbul ignore next */ {
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'addUser',
      'User Creation failed',
      'PortalUserEntity',
      {}, {}, null
    )

    logger.error('%o', error)
    res
      .status(500)
      .send({ message: error })
  }
}
