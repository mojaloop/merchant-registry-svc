/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { checkPermissions } from '../middleware/check-permissions'
import { PermissionsEnum } from '../types/permissions'
import { authenticateJWT } from '../middleware/authenticate'
import { getUsers } from './user-controllers/get-users'
import { postUserLogin } from './user-controllers/post-user-login'

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

router.post('/users/login', postUserLogin)
export default router
