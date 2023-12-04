/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { checkPermissions } from '../middleware/checkPermissions'
import { PermissionsEnum } from '../types/permissions'
import { authenticateJWT } from '../middleware/authenticate'
import { getMerchantAudits } from './auditControllers/getMerchantAudits'
import { checkPortalUserType } from '../middleware/checkUserType'
import { PortalUserType } from 'shared-lib'
import { getHubAudits } from './auditControllers/getHubAudits'

const router = express.Router()

router.get('/audits/merchant',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_AUDIT_LOGS),
  checkPortalUserType(PortalUserType.DFSP),
  getMerchantAudits
)

router.get('/audits/hub',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_AUDIT_LOGS),
  checkPortalUserType(PortalUserType.HUB),
  getHubAudits
)

export default router
