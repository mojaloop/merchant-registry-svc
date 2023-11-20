/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { checkPermissions } from '../middleware/checkPermissions'
import { PermissionsEnum } from '../types/permissions'
import { authenticateJWT } from '../middleware/authenticate'
import { getUsers } from './userControllers/getUsers'
import { postUserLogin } from './userControllers/postUserLogin'
import { addUser } from './userControllers/addUserByAdmin'
import { verifyUserEmail } from './userControllers/verifyUser'
import { putUserResetPassword } from './userControllers/putUserResetPassword'
import { getUserProfile } from './userControllers/getUserProfile'
import { postUserRefresh } from './userControllers/refreshUserToken'
import { postUserLogout } from './userControllers/postUserLogout'

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

router.post('/users/logout', authenticateJWT, postUserLogout)

export default router
