import { type Application } from 'express'
import participant_routes from '../routes/participantRoutes'
import healthcheck_routes from '../routes/healthCheckRoute'
import audit_routes from '../routes/auditRoutes'
import {prepareError} from '../utils/error'

export default function setupRoutes (app: Application): void {
  app.use('/', participant_routes)
  app.use('/', healthcheck_routes)
  app.use('/', audit_routes)

  // Catch-all route to handle 404s
  app.use('*', (req, res) => {
    res.status(404).send(prepareError('Route not found'))
  })
}
