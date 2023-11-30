import { type Application } from 'express'
import helmet from 'helmet'
import morgan_config from './morganConfig'
import { generalRateLimiter } from '../middleware/rateLimiter'

export default function setupMiddlewares (app: Application): void {
  app.use(morgan_config)
  app.use(generalRateLimiter)
  app.use(helmet())
}
