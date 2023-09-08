/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { checkPermissions } from '../middleware/check-permissions'
import { PermissionsEnum } from '../types/permissions'
import { authenticateJWT } from '../middleware/authenticate'
import { getUsers } from './user-controllers/get-users'
import { postUserLogin } from './user-controllers/post-user-login'
import { addUser } from './user-controllers/add-user-by-admin'
import { verifyUserEmail } from './user-controllers/verify-user'
import { putUserResetPassword } from './user-controllers/put-user-password'
import { getUserProfile } from './user-controllers/get-user-profile'
import { postUserRefresh } from './user-controllers/refresh-user-token'

/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Portal Users
 *     security:
 *       - Authorization: []
 *     summary: GET Portal Users List
 *     responses:
 *       200:
 *         description: GET Portal Users List
 */

const router = express.Router()
router.get('/users',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_PORTAL_USERS),
  getUsers
)

router.post('/users/add',
  authenticateJWT,
  checkPermissions(PermissionsEnum.CREATE_PORTAL_USERS),
  addUser
)

router.get('/users/verify',
  verifyUserEmail
)

router.put('/users/reset-password',
  authenticateJWT,
  putUserResetPassword
)

router.post('/users/login', postUserLogin)

router.get('/users/profile', authenticateJWT, getUserProfile)

router.post('/users/refresh', authenticateJWT, postUserRefresh)

export default router
