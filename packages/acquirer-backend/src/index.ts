import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import swaggerUi from 'swagger-ui-express'
import { initializeDatabase } from './database/init-database'
import logger from './services/logger'
import morgan_config from './morgan-config'
import health_check_route from './routes/health-check-route'
import merchant_routes from './routes/merchant-routes'
import user_routes from './routes/user-routes'
import config_routes from './routes/config-routes'
import audit_routes from './routes/audit-routes'
import { openAPISpecification } from './openapi-spec-config'
import {
  merchantDocumentBucketName,
  minioClient, createMerchantDocumentBucket
} from './services/minioClient'

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
app.use('/api/v1', config_routes)
app.use('/api/v1', audit_routes)

// eslint-disable-next-line
app.listen(PORT, HOSTNAME, async () => {
  logger.info(`Merchant Acquirer API is running on http://${HOSTNAME}:${PORT}/api/v1`)
  logger.info(`Swagger API Documentation UI is running on http://${HOSTNAME}:${PORT}/docs`)

  await tryInitializeMinio()
  await tryInitializeDatabase()
})

async function tryInitializeMinio (): Promise<void> {
  try {
    await minioClient.listBuckets()
    await createMerchantDocumentBucket()
    await minioClient.putObject(merchantDocumentBucketName, 'test.txt', 'Hello World!')
    logger.info('Minio successfully initialized.')
  } catch (error: any) {
    logger.error('Minio Initializing error: %s', error.message)
    logger.info('Retrying Minio setup in 3 seconds...')

    // Retry after 3 seconds
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(tryInitializeMinio, 3000)
  }
}

async function tryInitializeDatabase (): Promise<void> {
  try {
    await initializeDatabase()
  } catch (error: any) {
    logger.error('MySQL Database Initializing error: %s', error.message)
    logger.info('Retrying in 3 seconds...')

    // Retry after 3 seconds
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(tryInitializeDatabase, 3000)
  }
}
