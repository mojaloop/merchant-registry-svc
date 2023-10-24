import express from 'express'
import logger from '../../src/services/logger'
import {
  createMerchantDocumentBucket,
  removeMerchantDocumentBucket
} from '../../src/services/S3Client'
import { initializeDatabase } from '../../src/database/initDatabase'
import { AppDataSource } from '../../src/database/dataSource'
import setupRoutes from '../../src/setup/routesSetup'
import { testSucceedHealthCheck } from './healthCheck.tests'
import { disconnectMessageQueue } from '../../src/services/messageQueue'
import { testUserLoginFails } from './testUserLoginFails'
import { testUserLoginSucceed } from './testUserLoginSucceed'
import { testGetMerchantsFails } from './testGetMerchantsFails'
import { testGetMerchantsSucceed } from './testGetMerchantsSucceed'
import { testPostMerchantDraft } from './testPostMerchantDraft'
import { testPostDFSP } from './testPostDFSP'
import { testPostExternalDFSPClientAcess } from './testPostExternalDFSPClientAccess'
import { testGetDFSPs } from './testGetDFSP'
import { testPutMerchantStatusReadyToReview } from './testPutMerchantReadyStatus'
import { testPutMerchantStatusApprove } from './testPutMerchantApproveStatus'
import { testPutMerchantRejectStatus } from './testPutMerchantRejectStatus'
import { testPutMerchantRevertStatus } from './testPutMerchantRevertStatus'
import { testGetUserProfile } from './testGetUserProfile'
import { testGetAudits } from './testGetAudits'
import { testGETMerchantXlsxWorkbook } from './testMerchantXlsxWorkbook'

logger.silent = true

const app = express()
app.use(express.json())
setupRoutes(app)

describe('E2E API Tests', () => {
  beforeAll(async () => {
    await initializeDatabase()
    await createMerchantDocumentBucket()
  }, 60000) // wait for 60secs for db to initialize

  afterAll(async () => {
    await AppDataSource.destroy()
    await removeMerchantDocumentBucket()
    await disconnectMessageQueue()
  })

  describe('GET Merchants API Tests', () => {
    testGetMerchantsFails(app)
    testGetMerchantsSucceed(app)
  })

  describe('POST Merchant Draft API Tests', () => {
    testPostMerchantDraft(app)
  })

  describe('PUT Merchant Status ReadyToReview API Tests', () => {
    testPutMerchantStatusReadyToReview(app)
  })

  describe('PUT Merchant Status Approve API Tests', () => {
    testPutMerchantStatusApprove(app)
  })

  describe('PUT Merchant Status Reject API Tests', () => {
    testPutMerchantRejectStatus(app)
  })

  describe('PUT Merchant Status Revert API Tests', () => {
    testPutMerchantRevertStatus(app)
  })

  describe('POST Create DFSP API Tests', () => {
    testPostDFSP(app)
    testGetDFSPs(app)
  })

  describe('POST Create External DFSP Client Access Key', () => {
    testPostExternalDFSPClientAcess(app)
  })

  describe('POST Users Login API Tests', () => {
    testUserLoginFails(app)
    testUserLoginSucceed(app)
  })

  describe('GET Users Profile API Tests', () => {
    testGetUserProfile(app)
  })

  describe('Health Check API Tests', () => {
    testSucceedHealthCheck(app)
  })

  describe('GET Audits API Tests', () => {
    testGetAudits(app)
  })

  describe('GET Merchants XLSX Export With IDs API Tests', () => {
    testGETMerchantXlsxWorkbook(app)
  })
})
