import logger from '../../src/services/logger'
import { seedCategoryCodeTests } from './seedCategoryCode.tests'
import { seedCurrencyTests } from './seedCurrency.tests'
import { seedDFSPsTests } from './seedDFSPs.tests'
import { seedDefaultRolesTests } from './seedDefaultRoles.tests'
import { seedDefaultPermissionsTests } from './seedDefaultPermissions.tests'
import { seedDefaultUsersTests } from './seedDefaultUsers.tests'
import { seedCountriesSubdivisionsDistrictsTests } from './seedCountriesSubDivDistricts.tests'
import { s3ClientTests } from './uploadMerchantDocument.tests'

logger.silent = true

describe('Integration Tests', () => {
  describe('seedCategoryCode', () => {
    seedCategoryCodeTests()
  })

  describe('seedCurrency', () => {
    seedCurrencyTests()
  })

  describe('seedDFSPs', () => {
    seedDFSPsTests()
  })

  describe('seedDefaultRoles', () => {
    seedDefaultRolesTests()
  })

  describe('seedDefaultPermissions', () => {
    seedDefaultPermissionsTests()
  })

  describe('seedDefaultUsers', () => {
    seedDefaultUsersTests()
  })

  describe('seedCountriesSubdivisionsDistricts', () => {
    seedCountriesSubdivisionsDistrictsTests()
  })

  describe('S3Client Tests', () => {
    s3ClientTests()
  })
})
