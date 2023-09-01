/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { checkPermissions } from '../middleware/check-permissions'
import { PermissionsEnum } from '../types/permissions'
import { authenticateJWT } from '../middleware/authenticate'
import { getAudits } from './audit-controllers/get-audits'

const router = express.Router()

router.get('/audits',
  authenticateJWT,
  checkPermissions(PermissionsEnum.VIEW_AUDIT_LOGS),
  getAudits
)

export default router
