/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { checkPermissions } from '../middleware/checkPermissions'
import { PermissionsEnum } from '../types/permissions'
import { authenticateJWT } from '../middleware/authenticate'
import { checkUserUserType } from '../middleware/checkUserType'
import { PortalUserType } from 'shared-lib'
import { getDFSPs } from './dfspControllers/getDFSP'
import { postCreateDFSP } from './dfspControllers/postCreateDFSP'

const router = express.Router()
router.get('/dfsps',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_DFSPS),
  checkUserUserType(PortalUserType.HUB), // Only Hub Admin can view DFSPs
  getDFSPs
)

router.post('/dfsps',
  authenticateJWT,
  checkPermissions(PermissionsEnum.CREATE_DFSPS),
  checkUserUserType(PortalUserType.HUB), // Only Hub Admin can create DFSPs
  postCreateDFSP
)

// router.delete('/dfsps/:id',
//   authenticateJWT,
//   checkPermissions(PermissionsEnum.DELETE_DFSPS),
//   checkUserUserType(PortalUserType.HUB), // Only Hub Admin can delete DFSPs
//   deleteDfsp
// )
export default router
