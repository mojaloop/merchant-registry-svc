/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { checkPermissions } from '../middleware/checkPermissions'
import { PermissionsEnum } from '../types/permissions'
import { authenticateJWT } from '../middleware/authenticate'
import { getRoles } from './roleControllers/getRoles'
import { postCreateRole } from './roleControllers/postRoleCreate'
import { putRoleUpdatePermissions } from './roleControllers/putRoleUpdatePermissions'

const router = express.Router()
router.get('/roles',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_ROLES),
  getRoles
)

router.post('/roles',
  authenticateJWT,
  checkPermissions(PermissionsEnum.CREATE_ROLES),
  postCreateRole
)

router.put('/roles/:id',
  authenticateJWT,
  checkPermissions(PermissionsEnum.EDIT_ROLES),
  putRoleUpdatePermissions
)
export default router
