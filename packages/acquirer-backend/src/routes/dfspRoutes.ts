/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { checkPermissions } from '../middleware/checkPermissions'
import { PermissionsEnum } from '../types/permissions'
import { authenticateJWT } from '../middleware/authenticate'
import { checkPortalUserType } from '../middleware/checkUserType'
import { PortalUserType } from 'shared-lib'
import { getDFSPs } from './dfspControllers/getDFSP'
import { getMojaloopDFSPs } from './dfspControllers/getMojaloopDFSP'
import { postCreateDFSP } from './dfspControllers/postCreateDFSP'
import { postAddMojaloopDfsp } from './dfspControllers/postAddMojaloopDfsp'
import { createClientAccessKey } from './dfspControllers/createClientAccessKey'

const router = express.Router()
router.get('/dfsps',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_DFSPS),
  checkPortalUserType(PortalUserType.HUB), // Only Hub Admin can view DFSPs
  getDFSPs
)
router.get('/mojaloop-dfsps',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_DFSPS),
  checkUserUserType(PortalUserType.HUB), // Only Hub Admin can view DFSPs
  getMojaloopDFSPs
)
router.post('/dfsps',
  authenticateJWT,
  checkPermissions(PermissionsEnum.CREATE_DFSPS),
  checkPortalUserType(PortalUserType.HUB), // Only Hub Admin can create DFSPs
  postCreateDFSP
)
router.post('/add-mojaloop-dfsp',
    authenticateJWT,
    checkPermissions(PermissionsEnum.CREATE_DFSPS),
    checkUserUserType(PortalUserType.HUB), // Only Hub Admin can create DFSPs
    postAddMojaloopDfsp
)
router.post('/dfsps/:id/client-access-key',
  authenticateJWT,
  checkPermissions(PermissionsEnum.EDIT_DFSPS),
  checkPortalUserType(PortalUserType.HUB), // Only Hub Admin can create DFSPs
  createClientAccessKey
)

// router.delete('/dfsps/:id',
//   authenticateJWT,
//   checkPermissions(PermissionsEnum.DELETE_DFSPS),
//   checkUserUserType(PortalUserType.HUB), // Only Hub Admin can delete DFSPs
//   deleteDfsp
// )
export default router
