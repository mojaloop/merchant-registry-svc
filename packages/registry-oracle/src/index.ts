import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import setupSwagger from './setup/swaggerSetup'
import setupMiddlewares from './setup/middlewaresSetup'
import setupRoutes from './setup/routesSetup'
import setupServer from './setup/serverSetup'
import { readEnv } from './setup/readEnv'
import './services/messageQueueConsumer'
import { tryInitializeDatabase } from './setup/serviceInitializersSetup'

const HOSTNAME: string = readEnv('HOST', 'localhost') as string
const PORT: number = readEnv('PORT', 6666, true) as number

const app = express()
app.use(express.json())
app.use(cors())

setupMiddlewares(app)
setupSwagger(app)
setupRoutes(app)

setupServer(app, HOSTNAME, PORT, tryInitializeDatabase)
