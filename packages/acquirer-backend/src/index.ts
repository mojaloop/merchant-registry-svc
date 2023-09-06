import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import setupSwagger from './setup/swagger-setup'
import setupMiddlewares from './setup/middleware-setup'
import setupRoutes from './setup/routes-setup'
import setupServer from './setup/server-setup'
import { readEnv } from './setup/readEnv'
import { tryInitializeDatabase, tryInitializeS3 } from './setup/service-initializers-setup'
import { sendGridSetup } from './setup/check-sendgrid-email-service'
import ms from 'ms'
import logger from './services/logger'

const HOSTNAME: string = readEnv('HOST', 'localhost') as string
const PORT: number = readEnv('PORT', 3000, true) as number

const app = express()
app.use(express.json())
app.use(cors())

sendGridSetup()

setupMiddlewares(app)
setupSwagger(app)
setupRoutes(app)

// check JWT_EXPIRES_IN is valid
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1d'
if (ms(JWT_EXPIRES_IN) === undefined) {
  logger.error(`JWT_EXPIRES_IN is invalid: ${JWT_EXPIRES_IN}`)
  process.exit(1)
}

setupServer(app, HOSTNAME, PORT, tryInitializeS3, tryInitializeDatabase)
