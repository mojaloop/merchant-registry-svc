import express from 'express'
import logger from '../../src/services/logger'
import {
  createMerchantDocumentBucket
} from '../../src/services/S3Client'
import { initializeDatabase } from '../../src/database/initDatabase'
import { AppDataSource } from '../../src/database/dataSource'
import setupRoutes from '../../src/setup/routesSetup'
import { testSucceedHealthCheck, testSucceedHealthCheckSendGridService } from './healthCheck.tests'
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
import { testPutConfigTraceLevel } from './testPutConfigTraceLevel'
import { testGetCountries } from './testGetCountries'
import { testGetSubDivisions } from './testGetSubDivisions'
import { testGetDistricts } from './testGetDistricts'
import { testGetMerchantById } from './testGetMerchantById'
import { testPostMerchantLocations } from './testPostMerchantLocation'
import { testGetMerchantLocations } from './testGetMerchantLocations'
import { testGetUsers } from './testGetUsers'
import { testGetCheckoutCounters } from './testGetCheckoutCounters'
import { testGetRoles } from './testGetRoles'
import { testGetMerchantDraftCounts } from './testGetMerchantDraftCounts'
import { testPostCreateUser } from './testPostCreateUser'
import { testPutUserResetPassword } from './testPutUserResetPassword'
import { testGETMerchantXlsxWorkbookFilter } from './testMerchantXlsxWorkbookFilter'
import { testPostUserRefreshToken } from './testPutUserRefreshToken'
import { testPostMerchantContactPerson } from './testPostMerchantContactPerson'
import { testPostMerchantOwner } from './testPostMerchantOwner'
import { testPutMerchantDraft } from './testPutMerchantDraft'
import { testPostRolecreate } from './testPostRoleCreate'
import { testPutRoleUpdatePermissions } from './testPutRoleUpdatePermissions'
import { testPutMerchantOwner } from './testPutMerchantOwner'
import { testPutMerchantContactPerson } from './testPutMerchantContactPerson'
import { testPutMerchantLocations } from './testPutMerchantLocation'
import { testVerifyUser } from './testVerifyUser'

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([
    {
      statusCode: 200,
      body: '',
      headers: {}
    }
  ])
}))

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
    // await removeMerchantDocumentBucket()
    await disconnectMessageQueue()
  })

  describe('GET Merchants API Tests', () => {
    testGetMerchantsFails(app)
    testGetMerchantsSucceed(app)
  })

  describe('GET Merchant By Id API Tests', () => {
    testGetMerchantById(app)
  })

  describe('GET Merchant Checkout Counters API Tests', () => {
    testGetCheckoutCounters(app)
  })

  describe('POST Merchant Draft API Tests', () => {
    testPostMerchantDraft(app)
  })

  describe('GET Merchant Locations API Tests', () => {
    testGetMerchantLocations(app)
  })

  describe('POST Merchant Location API Tests', () => {
    testPostMerchantLocations(app)
  })

  describe('POST Merchant Business Owner API Tests', () => {
    testPostMerchantOwner(app)
  })

  describe('POST Merchant Contact Person API Tests', () => {
    testPostMerchantContactPerson(app)
  })

  describe('PUT Merchant Draft API Tests', () => {
    testPutMerchantDraft(app)
  })

  describe('PUT Merchant Location API Tests', () => {
    testPutMerchantLocations(app)
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

  describe('PUT Merchant Business Owner API Tests', () => {
    testPutMerchantOwner(app)
  })

  describe('PUT Merchant Contact Person API Tests', () => {
    testPutMerchantContactPerson(app)
  })

  describe('GET Merchant Draft Counts API Tests', () => {
    testGetMerchantDraftCounts(app)
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
    testSucceedHealthCheckSendGridService(app)
  })

  describe('GET Audits API Tests', () => {
    testGetAudits(app)
  })

  describe('GET Users List API Tests', () => {
    testGetUsers(app)
  })

  describe('POST Create Portal User API Tests', () => {
    testPostCreateUser(app)
  })

  describe('PUT Reset User Password API Tests', () => {
    testPutUserResetPassword(app)
  })

  describe('PUT Refresh User Token API Tests', () => {
    testPostUserRefreshToken(app)
  })

  describe('GET Merchants XLSX Export With IDs API Tests', () => {
    testGETMerchantXlsxWorkbook(app)
    testGETMerchantXlsxWorkbookFilter(app)
  })

  describe('PUT Config Trace Level API Tests', () => {
    testPutConfigTraceLevel(app)
  })

  describe('GET Countries, SubDivision, Districts API Tests', () => {
    testGetCountries(app)
    testGetSubDivisions(app)
    testGetDistricts(app)
  })

  describe('GET Roles API Tests', () => {
    testGetRoles(app)
  })

  describe('POST Roles Create API Tests', () => {
    testPostRolecreate(app)
  })

  describe('PUT Roles Update Permissions API Tests', () => {
    testPutRoleUpdatePermissions(app)
  })

  describe('Verify User API Tests', () => {
    testVerifyUser(app)
  })
})
