import { AppDataSource } from '../../src/database/dataSource'
import logger from '../../src/services/logger'
import { testRegisterDFSPEndpoint } from './registerEndpointDFSP.tests'
import { testRegisterMerchants } from './registerMerchants.tests'

logger.silent = true

describe('Integration Tests', () => {
  beforeAll(async () => {
    await AppDataSource.initialize()
  })

  afterAll(async () => {
    await AppDataSource.destroy()
  })

  describe('Tests registerMerchants', () => {
    testRegisterMerchants()
  })

  describe('Tests registerEndpointDFSP', () => {
    testRegisterDFSPEndpoint()
  })
})
