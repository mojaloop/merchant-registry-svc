import express, { type Request, type Response } from 'express'
import { getAudits } from './audit-controllers/get-audits'

const router = express.Router()

router.get('/audits', getAudits)

export default router
