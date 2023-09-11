import { type Application } from 'express'
import health_check_route from '../routes/health-check-route'
import merchant_routes from '../routes/merchant-routes'
import user_routes from '../routes/user-routes'
import config_routes from '../routes/config-routes'
import audit_routes from '../routes/audit-routes'
import role_routes from '../routes/roles-routes'
import country_routes from '../routes/countries-routes'

export default function setupRoutes (app: Application): void {
  app.use('/api/v1', health_check_route)
  app.use('/api/v1', merchant_routes)
  app.use('/api/v1', user_routes)
  app.use('/api/v1', config_routes)
  app.use('/api/v1', audit_routes)
  app.use('/api/v1', role_routes)
  app.use('/api/v1', country_routes)
}
