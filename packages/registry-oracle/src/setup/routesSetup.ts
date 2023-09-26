import { type Application } from 'express'
import participant_routes from '../routes/participantRoutes'
import healthcheck_routes from '../routes/healthCheckRoute'
import {prepareError} from '../utils/error'

export default function setupRoutes (app: Application): void {
  app.use('/', participant_routes)
  app.use('/', healthcheck_routes)

  // Catch-all route to handle 404s
  app.use('*', (req, res) => {
    res.status(404).send(prepareError('Route not found'))
  })
}
