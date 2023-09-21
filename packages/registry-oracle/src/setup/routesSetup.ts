import { type Application } from 'express'
import participant_routes from '../routes/participantRoutes'

export default function setupRoutes (app: Application): void {
  app.use('/', participant_routes)
}
