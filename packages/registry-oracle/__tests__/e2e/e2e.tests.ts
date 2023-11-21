import express from 'express'
import setupRoutes from '../../src/setup/routesSetup'
import logger from '../../src/services/logger'
import { AppDataSource } from '../../src/database/dataSource'
import { initializeDatabase } from '../../src/database/initDatabase'
import { disconnectMessageQueue } from '../../src/services/messageQueueConsumer'
import { GETParticipantsTests } from './GETParticipants.tests'
import { POSTParticipantsTests } from './POSTParticipants.tests'

logger.silent = true
const app = express()
app.use(express.json())
setupRoutes(app)

describe('E2E API Tests', () => {
  beforeAll(async () => {
    await initializeDatabase()
  })

  afterAll(async () => {
    await AppDataSource.destroy()
    await disconnectMessageQueue()
  })

  describe('GET Participants', () => {
    GETParticipantsTests(app)
  })

  describe('POST Participants', () => {
    POSTParticipantsTests(app)
  })
})
