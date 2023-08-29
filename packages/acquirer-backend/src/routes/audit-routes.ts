/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { authenticateJWT } from '../middleware/authenticate'
import { getAudits } from './audit-controllers/get-audits'

const router = express.Router()

router.get('/audits', authenticateJWT, getAudits)

export default router
