import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import swaggerUi from 'swagger-ui-express'
import { initializeDatabase } from './database/init-database'
import logger from './logger'
import morgan_config from './morgan-config'
import health_check_route from './routes/health-check-route'
import merchant_routes from './routes/merchant-routes'
import user_routes from './routes/user-routes'
import { openAPISpecification } from './openapi-spec-config'

const HOSTNAME: string = process.env.HOST ?? 'localhost'
const PORT: number = parseInt(
  process.env.PORT !== null && process.env.PORT !== undefined && process.env.PORT !== ''
    ? process.env.PORT
    : '3000'
)

const app = express()
app.use(express.json())
app.use(cors())

// set middleware to log all requests
app.use(morgan_config)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openAPISpecification))
app.use('/api/v1', health_check_route)
app.use('/api/v1', merchant_routes)
app.use('/api/v1', user_routes)

app.listen(PORT, HOSTNAME, () => {
  logger.info(`Merchant Acquirer API is running on http://${HOSTNAME}:${PORT}/api/v1`)
  logger.info(`Swagger API Documentation UI is running on http://${HOSTNAME}:${PORT}/docs`)
  initializeDatabase()
    .then(async () => {
    })
    .catch(error => {
      logger.error('MySQL Database Initializing error: %s', error.message)
      logger.error('Exiting...')
      process.exit(1)
    })
})
