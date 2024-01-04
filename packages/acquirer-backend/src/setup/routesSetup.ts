import { type Application } from 'express'
import health_check_route from '../routes/healthCheckRoute'
import merchant_routes from '../routes/merchantRoutes'
import user_routes from '../routes/userRoutes'
import config_routes from '../routes/configRoutes'
import audit_routes from '../routes/auditRoutes'
import role_routes from '../routes/rolesRoutes'
import country_routes from '../routes/countriesRoutes'
import dfsp_routes from '../routes/dfspRoutes'

export default function setupRoutes (app: Application): void {
  app.use('/api/v1', health_check_route)
  app.use('/api/v1', merchant_routes)
  app.use('/api/v1', user_routes)
  app.use('/api/v1', config_routes)
  app.use('/api/v1', audit_routes)
  app.use('/api/v1', role_routes)
  app.use('/api/v1', country_routes)
  app.use('/api/v1', dfsp_routes)

  // Catch-all route to handle 404s
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' })
  })
}
