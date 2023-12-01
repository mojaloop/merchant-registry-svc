/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { checkPermissions } from '../middleware/checkPermissions'
import { PermissionsEnum } from '../types/permissions'
import { authenticateJWT } from '../middleware/authenticate'
import { checkUserUserType } from '../middleware/checkUserType'
import { PortalUserType } from 'shared-lib'
import { getOnboardedDFPS } from './onboardDfspControllers/getOnboardedDfps'
import { postOnboardDFSP } from './onboardDfspControllers/postOnboardDfsp'

const router = express.Router()
router.get('/onboarded_dfsps',
    authenticateJWT,
    checkPermissions(PermissionsEnum.VIEW_DFSPS),
    checkUserUserType(PortalUserType.HUB), // for now only hub user can view onboarded dfsps
    getOnboardedDFPS
)

router.post('/onboard_dfsp',
    authenticateJWT,
    checkPermissions(PermissionsEnum.CREATE_DFSPS),
    checkUserUserType(PortalUserType.HUB), // for now only hub user can onboard dfsp
    postOnboardDFSP
)

export default router
