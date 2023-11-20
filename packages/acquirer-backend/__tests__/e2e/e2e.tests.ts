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
import { testUserLoginFails } from './UserLoginFails.tests'
import { testUserLoginSucceed } from './UserLoginSucceed.tests'
import { testGetMerchantsFails } from './GetMerchantsFails.tests'
import { testGetMerchantsSucceed } from './GetMerchantsSucceed.tests'
import { testPostMerchantDraft } from './PostMerchantDraft.tests'
import { testPostDFSP } from './PostDFSP.tests'
import { testPostExternalDFSPClientAcess } from './PostExternalDFSPClientAccess.tests'
import { testGetDFSPs } from './GetDFSP.tests'
import { testPutMerchantStatusReadyToReview } from './PutMerchantReadyStatus.tests'
import { testPutMerchantStatusApprove } from './PutMerchantApproveStatus.tests'
import { testPutMerchantRejectStatus } from './PutMerchantRejectStatus.tests'
import { testPutMerchantRevertStatus } from './PutMerchantRevertStatus.tests'
import { testGetUserProfile } from './GetUserProfile.tests'
import { testGetAudits } from './GetAudits.tests'
import { testGETMerchantXlsxWorkbook } from './MerchantXlsxWorkbook.tests'
import { testPutConfigTraceLevel } from './PutConfigTraceLevel.tests'
import { testGetCountries } from './GetCountries.tests'
import { testGetSubDivisions } from './GetSubDivisions.tests'
import { testGetDistricts } from './GetDistricts.tests'
import { testGetMerchantById } from './GetMerchantById.tests'
import { testPostMerchantLocations } from './PostMerchantLocation.tests'
import { testGetMerchantLocations } from './GetMerchantLocations.tests'
import { testGetUsers } from './GetUsers.tests'
import { testGetCheckoutCounters } from './GetCheckoutCounters.tests'
import { testGetRoles } from './GetRoles.tests'
import { testGetMerchantDraftCounts } from './GetMerchantDraftCounts.tests'
import { testPostCreateUser } from './PostCreateUser.tests'
import { testPutUserResetPassword } from './PutUserResetPassword.tests'
import { testGETMerchantXlsxWorkbookFilter } from './MerchantXlsxWorkbookFilter.tests'
import { testPostUserRefreshToken } from './PutUserRefreshToken.tests'
import { testPostMerchantContactPerson } from './PostMerchantContactPerson.tests'
import { testPostMerchantOwner } from './PostMerchantOwner.tests'
import { testPutMerchantDraft } from './PutMerchantDraft.tests'
import { testPostRolecreate } from './PostRoleCreate.tests'
import { testPutRoleUpdatePermissions } from './PutRoleUpdatePermissions.tests'
import { testPutMerchantOwner } from './PutMerchantOwner.tests'
import { testPutMerchantContactPerson } from './PutMerchantContactPerson.tests'
import { testPutMerchantLocations } from './PutMerchantLocation.tests'
import { testVerifyUser } from './VerifyUser.tests'
import { testPostUserLogout } from './PostUserLogout.tests'

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

  describe('POST User Logout API Tests', () => {
    testPostUserLogout(app)
  })
})
