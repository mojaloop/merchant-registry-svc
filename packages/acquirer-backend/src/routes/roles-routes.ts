/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { checkPermissions } from '../middleware/check-permissions'
import { PermissionsEnum } from '../types/permissions'
import { authenticateJWT } from '../middleware/authenticate'
import { getRoles } from './role-controllers/get-roles'
import { postRole } from './role-controllers/post-role'

const router = express.Router()
router.get('/roles',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_ROLES),
  getRoles
)

router.post('/roles',
  authenticateJWT,
  checkPermissions(PermissionsEnum.CREATE_ROLES),
  postRole
)
export default router
