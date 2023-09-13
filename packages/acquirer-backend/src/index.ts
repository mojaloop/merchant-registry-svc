import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import setupSwagger from './setup/swaggerSetup'
import setupMiddlewares from './setup/middlewaresSetup'
import setupRoutes from './setup/routesSetup'
import setupServer from './setup/serverSetup'
import { readEnv } from './setup/readEnv'
import { tryInitializeDatabase, tryInitializeS3 } from './setup/serviceInitializersSetup'
import { sendGridSetup } from './setup/checkSendgridEmailService'
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
