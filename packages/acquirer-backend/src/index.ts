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

const HOSTNAME: string = readEnv('HOST', 'localhost') as string
const PORT: number = readEnv('PORT', 3000, true) as number

const app = express()
app.use(express.json())
app.use(cors())

sendGridSetup()

setupMiddlewares(app)
setupSwagger(app)
setupRoutes(app)

setupServer(app, HOSTNAME, PORT, tryInitializeS3, tryInitializeDatabase)
