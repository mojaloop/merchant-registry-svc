/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
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
router.get('/users', authenticateJWT, getUsers)

router.post('/users/login', postUserLogin)
export default router
