import request from 'supertest'
import express from 'express'
import path from 'path'
import merchant_router from '../../src/routes/merchant-routes'
import { AppDataSource } from '../../src/database/data-source'
import logger from '../../src/logger'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { initializeDatabase } from '../../src/database/init-database'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { ContactPersonEntity } from '../../src/entity/ContactPersonEntity'
import { BusinessOwnerEntity } from '../../src/entity/BusinessOwnerEntity'
import {
  BusinessOwnerIDType,
  Countries,
  CurrencyCodes,
  MerchantLocationType,
  MerchantRegistrationStatus, MerchantType, NumberOfEmployees
} from 'shared-lib'
import { CheckoutCounterEntity } from '../../src/entity/CheckoutCounterEntity'
import { BusinessLicenseEntity } from '../../src/entity/BusinessLicenseEntity'
import { MerchantLocationEntity } from '../../src/entity/MerchantLocationEntity'
import {
  createMerchantDocumentBucket,
  getMerchantDocumentURL,
  removeMerchantDocument,
  removeMerchantDocumentBucket
} from '../../src/middleware/minioClient'

const app = express()
app.use(express.json())
app.use('/api/v1', merchant_router)

logger.silent = true

describe('Merchant Routes Tests', () => {
  beforeAll(async () => {
    await initializeDatabase()
    await createMerchantDocumentBucket()
  }, 20000) // wait for 20secs for db to initialize

  afterAll(async () => {
    await AppDataSource.destroy()
    await removeMerchantDocumentBucket()
  })

  describe('GET /api/v1/merchants', () => {
    let makerUser: PortalUserEntity | null
    let checkerUser: PortalUserEntity | null
    let merchant1: MerchantEntity
    let merchant2: MerchantEntity
    let merchant3: MerchantEntity
    //
    beforeAll(async () => {
      const userRepository = AppDataSource.getRepository(PortalUserEntity)
      makerUser = await userRepository.findOne({
        where: { email: process.env.TEST1_EMAIL ?? '' }
      })
      checkerUser = await userRepository.findOne({
        where: { email: process.env.TEST2_EMAIL ?? '' }
      })

      merchant1 = await AppDataSource.manager.save(MerchantEntity, {
        dba_trading_name: 'Test Merchant 1 For Filter',
        registered_name: 'Test Registered 1',
        employees_num: NumberOfEmployees.ONE_TO_FIVE,
        merchant_type: MerchantType.INDIVIDUAL,

        // checked_by will be undefined when registration_status is DRAFT
        registration_status: MerchantRegistrationStatus.DRAFT,
        created_by: makerUser ?? undefined,
        checked_by: undefined
      })
      merchant2 = await AppDataSource.manager.save(MerchantEntity, {
        dba_trading_name: 'Test Merchant 2 For Filter',
        registered_name: 'Test Registered 2',
        employees_num: NumberOfEmployees.ELEVEN_TO_FIFTY,
        merchant_type: MerchantType.CHAIN_STORE,

        // checked_by will be undefined when registration_status is REVIEW
        registration_status: MerchantRegistrationStatus.REVIEW,
        created_by: makerUser ?? undefined,
        checked_by: undefined
      })

      merchant3 = await AppDataSource.manager.save(MerchantEntity, {
        dba_trading_name: 'Test Merchant 3 For Filter',
        registered_name: 'Test Registered 3',
        employees_num: NumberOfEmployees.HUNDRED_PLUS_PLUS,
        merchant_type: MerchantType.SMALL_SHOP,

        // checked_by is not undefined when registration_status is APPROVED
        registration_status: MerchantRegistrationStatus.APPROVED,
        created_by: makerUser ?? undefined,
        checked_by: checkerUser ?? undefined
      })
    })

    afterAll(async () => {
      await AppDataSource.manager.delete(MerchantEntity, {})
    })

    it('should respond 200 with only 1 record for dba_trading_name filter', async () => {
    // Act
      const res = await request(app)
        .get('/api/v1/merchants')
        .query({
          dbaName: 'Test Merchant 1'
        })
        .set('Authorization', `Bearer ${process.env.TEST1_DUMMY_AUTH_TOKEN ?? ''}`)

      // Assert
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('OK')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveLength(1) // Only one merchant should match the filter
      expect(res.body.data[0].dba_trading_name).toEqual('Test Merchant 1 For Filter')
    })

    it('should respond 200 with 3 records for partial dba_trading_name', async () => {
    // Act
      const res = await request(app)
        .get('/api/v1/merchants')
        .query({
          dbaName: 'Test'
        })
        .set('Authorization', `Bearer ${process.env.TEST1_DUMMY_AUTH_TOKEN ?? ''}`)

      // Assert
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('OK')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveLength(3) // 3 merchants should match the filter
      expect(res.body.data[0]).toHaveProperty('dba_trading_name')
    })

    it('should respond 200 for only filter DRAFT status', async () => {
    // Arrange

      // Act
      const res = await request(app)
        .get('/api/v1/merchants')
        .query({
          registrationStatus: MerchantRegistrationStatus.DRAFT
        })
        .set('Authorization', `Bearer ${process.env.TEST1_DUMMY_AUTH_TOKEN ?? ''}`)

      // Assert
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('OK')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveLength(1) // Only one merchant should match the filter
      expect(res.body.data[0].registration_status).toEqual(MerchantRegistrationStatus.DRAFT)
    })

    it('should respond 200 for only filter APPROVED status', async () => {
    // Act
      const res = await request(app)
        .get('/api/v1/merchants')
        .query({
          registrationStatus: MerchantRegistrationStatus.APPROVED
        })
        .set('Authorization', `Bearer ${process.env.TEST1_DUMMY_AUTH_TOKEN ?? ''}`)

      // Assert
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('OK')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveLength(1) // Only one merchant should match the filter
      expect(res.body.data[0].registration_status).toEqual(MerchantRegistrationStatus.APPROVED)

      // Approved merchant should have a checker
      expect(res.body.data[0]).toHaveProperty('checked_by')
      expect(res.body.data[0].checked_by).toHaveProperty('id')
    })

    it('should respond 200 with 1 record for approvedBy', async () => {
      // Act
      const res = await request(app)
        .get('/api/v1/merchants')
        .query({
          approvedBy: checkerUser?.id
        })

      // Assert
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('OK')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveLength(1) // Only one merchant should match the filter
      expect(res.body.data[0].checked_by).toHaveProperty('id')
      expect(res.body.data[0].checked_by.id).toEqual(checkerUser?.id)
      expect(res.body.data[0]).toHaveProperty('registration_status')
      expect(res.body.data[0].registration_status).toEqual(MerchantRegistrationStatus.APPROVED)
    })

    it('should respond 200 with 3 records for addedBy', async () => {
      // Act
      const res = await request(app)
        .get('/api/v1/merchants')
        .query({
          addedBy: makerUser?.id
        })

      // Assert
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('OK')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveLength(3) // Only one merchant should match the filter
      expect(res.body.data[0].created_by).toHaveProperty('id')
      expect(res.body.data[0].created_by.id).toEqual(makerUser?.id)
    })
  })

  describe('POST /api/v1/merchants/draft', () => {
    beforeEach(async () => {
      await AppDataSource.manager.delete(BusinessLicenseEntity, {})
      await AppDataSource.manager.delete(CheckoutCounterEntity, {})

      await AppDataSource.manager.delete(MerchantEntity, {})
    })
    it('should respond with 201 status and the created merchant', async () => {
      // Arrange

      // Act
      const res = await request(app)
        .post('/api/v1/merchants/draft')
        .set('Authorization', `Bearer ${process.env.TEST1_DUMMY_AUTH_TOKEN ?? ''}`)
        .field('dba_trading_name', 'Test Merchant 1')
        .field('registered_name', 'Test Merchant 1')
        .field('employees_num', NumberOfEmployees.ONE_TO_FIVE)
        .field('monthly_turnover', '0.5')
        .field('currency_code', CurrencyCodes.USD)
        .field('category_code', '01110')
        .field('merchant_type', MerchantType.INDIVIDUAL)
        .field('payinto_alias', 'P33')
        .field('registration_status', MerchantRegistrationStatus.DRAFT)
        .field('registration_status_reason', 'Drafting Merchant')
        .field('license_number', '007')
        .attach('licenseDocument', path.join(__dirname, '../test-files/dummy.pdf'))

      // Assert
      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('Drafting Merchant Successful')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data).toHaveProperty('business_licenses')
      expect(res.body.data.business_licenses).toHaveLength(1)
      expect(res.body.data.business_licenses[0]).toHaveProperty('license_document_link')
      const url = await getMerchantDocumentURL(
        res.body.data.business_licenses[0].license_document_link
      )
      expect(url).not.toBeNull()

      // Clean up
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: res.body.data.id }
      )
      await AppDataSource.manager.delete(
        CheckoutCounterEntity,
        { alias_value: res.body.data.id }
      )
      await AppDataSource.manager.delete(
        BusinessLicenseEntity,
        {}
      )
      await removeMerchantDocument(res.body.data.business_licenses[0].license_document_link)
    })
    // TODO: Add more tests and failure cases

    it('should respond with 201 status and when updating existing drafted merchant', async () => {
      // Arrange
      const checkoutCounter = await AppDataSource.manager.save(
        CheckoutCounterEntity,
        {
          alias_value: 'O33',
          description: 'Test Checkout Counter'
        }
      )

      const merchant = await AppDataSource.manager.save(
        MerchantEntity,
        {
          dba_trading_name: 'Test Merchant 1',
          registered_name: 'Test Merchant 1',
          employees_num: NumberOfEmployees.ONE_TO_FIVE,
          monthly_turnover: '0.5',
          currency_code: CurrencyCodes.USD,
          category_code: '01110',
          merchant_type: MerchantType.INDIVIDUAL,
          registration_status: MerchantRegistrationStatus.DRAFT,
          registration_status_reason: 'Drafting Merchant',
          checkout_counters: [checkoutCounter]
        }
      )

      // Act
      const res = await request(app)
        .post('/api/v1/merchants/draft')
        .set('Authorization', `Bearer ${process.env.TEST1_DUMMY_AUTH_TOKEN ?? ''}`)
        .field('id', merchant.id) // Updating existing merchant using id
        .field('dba_trading_name', 'Updated Merchant 1')
        .field('registered_name', 'Updated Merchant 1')
        .field('employees_num', NumberOfEmployees.FIFTY_ONE_TO_ONE_HUNDRED)
        .field('monthly_turnover', '0.5')
        .field('currency_code', CurrencyCodes.AED)
        .field('category_code', '01110')
        .field('merchant_type', MerchantType.INDIVIDUAL)
        .field('payinto_alias', 'N33')
        .field('license_number', '007')
        .attach('licenseDocument', path.join(__dirname, '../test-files/dummy.pdf'))

      // Assert
      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('Drafting Merchant Successful')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data.id).toEqual(merchant.id)
      expect(res.body.data.dba_trading_name).toEqual('Updated Merchant 1')
      expect(res.body.data.registered_name).toEqual('Updated Merchant 1')
      expect(res.body.data.employees_num).toEqual(NumberOfEmployees.FIFTY_ONE_TO_ONE_HUNDRED)
      expect(res.body.data.currency_code).toEqual(CurrencyCodes.AED)
      expect(res.body.data).toHaveProperty('checkout_counters')
      expect(res.body.data.checkout_counters).toHaveLength(1)
      expect(res.body.data.checkout_counters[0]).toHaveProperty('id')
      expect(res.body.data.checkout_counters[0]).toHaveProperty('alias_value')
      expect(res.body.data.checkout_counters[0].alias_value).toEqual('N33')

      const updatedMerchant = await AppDataSource.manager.findOne(
        MerchantEntity,
        { where: { id: merchant.id } }
      )
      expect(updatedMerchant?.dba_trading_name).toEqual('Updated Merchant 1')
      expect(updatedMerchant?.registered_name).toEqual('Updated Merchant 1')

      expect(res.body.data).toHaveProperty('business_licenses')
      expect(res.body.data.business_licenses).toHaveLength(1)

      expect(res.body.data.business_licenses[0]).toHaveProperty('license_document_link')

      // Clean up
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: res.body.data.id }
      )
      await AppDataSource.manager.delete(
        CheckoutCounterEntity,
        { id: res.body.data.checkout_counters[0].id }
      )
      await AppDataSource.manager.delete(
        BusinessLicenseEntity,
        {}
      )
      await removeMerchantDocument(res.body.data.business_licenses[0].license_document_link)
    })
    // TODO: Add more tests and failure cases
  })

  describe('POST /api/v1/merchants/:id/registration-status', () => {
    let test1User: PortalUserEntity | null
    let merchant: MerchantEntity | null

    beforeAll(async () => {
      test1User = await AppDataSource.manager.findOne(
        PortalUserEntity,
        { where: { email: process.env.TEST1_EMAIL ?? '' } }
      )
    })

    beforeEach(async () => {
      merchant = await AppDataSource.manager.save(
        MerchantEntity,
        {
          dba_trading_name: 'Test Merchant 1',
          registered_name: 'Test Merchant 1',
          employees_num: NumberOfEmployees.ONE_TO_FIVE,
          monthly_turnover: '0.5',
          currency_code: CurrencyCodes.USD,
          category_code: '01110',
          payinto_alias: 'merchant1',
          registration_status: MerchantRegistrationStatus.DRAFT,
          registration_status_reason: 'Drafting Merchant',
          // eslint-disable-next-line
          created_by: test1User ?? {}
        }
      )
    })

    afterEach(async () => {
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: merchant?.id }
      )
      merchant = null
    })

    it('should respond with 200 status and the updated merchant', async () => {
      // Arrange

      // Act
      const res = await request(app)
        // eslint-disable-next-line
        .put(`/api/v1/merchants/${merchant?.id}/registration-status`)
        .set('Authorization', `Bearer ${process.env.TEST2_DUMMY_AUTH_TOKEN ?? ''}`)
        .send({
          registration_status: MerchantRegistrationStatus.APPROVED,
          registration_status_reason: 'Approved Merchant'
        })

      // Assert
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('Status Updated')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data.registration_status).toEqual(MerchantRegistrationStatus.APPROVED)
      expect(res.body.data.registration_status_reason).toEqual('Approved Merchant')

      const updatedMerchant = await AppDataSource.manager.findOne(
        MerchantEntity,
        { where: { id: merchant?.id } }
      )
      expect(updatedMerchant?.registration_status).toEqual(MerchantRegistrationStatus.APPROVED)
    })

    // eslint-disable-next-line
    it('should respond with 401 status with message \'Same Hub User cannot do both Sumitting and Review Checking\'', async () => {
      // Arrange

      // Act
      const res = await request(app)
        // eslint-disable-next-line
        .put(`/api/v1/merchants/${merchant?.id}/registration-status`)
        // Test1 is the creator of the merchant and is also the one updating the status
        .set('Authorization', `Bearer ${process.env.TEST1_DUMMY_AUTH_TOKEN ?? ''}`)
        .send({
          registration_status: MerchantRegistrationStatus.APPROVED,
          registration_status_reason: 'Approved Merchant'
        })

      // Assert
      expect(res.statusCode).toEqual(401)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('Same Hub User cannot do both Sumitting and Review Checking')

      const originalMerchant = await AppDataSource.manager.findOne(
        MerchantEntity,
        { where: { id: merchant?.id } }
      )
      expect(originalMerchant?.registration_status).toEqual(MerchantRegistrationStatus.DRAFT)

      // Clean up
    })
  })

  describe('PUT /api/v1/merchants/:id/ready-to-review', () => {
    let makerUser: PortalUserEntity | null
    let merchant: MerchantEntity | null

    beforeAll(async () => {
      const userRepository = AppDataSource.getRepository(PortalUserEntity)
      makerUser = await userRepository.findOne({
        where: { email: process.env.TEST1_EMAIL ?? '' }
      })
    })

    beforeEach(async () => {
      merchant = await AppDataSource.manager.save(
        MerchantEntity,
        {
          dba_trading_name: 'Test Merchant 1',
          registered_name: 'Test Merchant 1',
          employees_num: NumberOfEmployees.ONE_TO_FIVE,
          monthly_turnover: '0.5',
          currency_code: CurrencyCodes.USD,
          category_code: '01110',
          registration_status: MerchantRegistrationStatus.DRAFT,
          registration_status_reason: 'Drafting Merchant',
          created_by: makerUser ?? {}
        }
      )
    })

    afterEach(async () => {
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: merchant?.id }
      )
    })

    it('should respond with 200 status and the updated merchant', async () => {
      // Arrange

      // Act
      const res = await request(app)
        .put(`/api/v1/merchants/${merchant?.id}/ready-to-review`)
        .set('Authorization', `Bearer ${process.env.TEST1_DUMMY_AUTH_TOKEN ?? ''}`)

      // Assert
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('Status Updated to Review')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data.registration_status).toEqual(MerchantRegistrationStatus.REVIEW)
    })

    // eslint-disable-next-line
    it('should respond with 401 status with message \'Only the Hub User who submitted the Draft Merchant can mark it as Review\'', async () => {
      // Arrange

      // Act
      const res = await request(app)
        .put(`/api/v1/merchants/${merchant?.id}/ready-to-review`)
        // Different User is trying to mark this as ready to review
        .set('Authorization', `Bearer ${process.env.TEST2_DUMMY_AUTH_TOKEN ?? ''}`)

      // Assert
      expect(res.statusCode).toEqual(401)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('Only the Hub User who submitted the Draft Merchant can mark it as Review')
    })
  })

  describe('POST /api/v1/merchants/:id/locations', () => {
    it('should respond with 201 status when create location valid data', async () => {
      const checkoutCounter = await AppDataSource.manager.save(
        CheckoutCounterEntity,
        {
          alias_value: 'P0055',
          description: 'Test Checkout Counter'
        }
      )
      // Arrange
      const merchant = await AppDataSource.manager.save(
        MerchantEntity,
        {
          dba_trading_name: 'Test Merchant 1',
          registered_name: 'Test Merchant 1',
          employees_num: NumberOfEmployees.ONE_TO_FIVE,
          monthly_turnover: '0.5',
          currency_code: CurrencyCodes.PHP,
          category_code: '10410',
          checkout_counters: [checkoutCounter]
        }
      )

      // Act
      const res = await request(app)
        .post(`/api/v1/merchants/${merchant.id}/locations`)
        .send({
          address_line: 'Test Address 1',
          country: Countries.United_States_of_America,
          location_type: MerchantLocationType.PHYSICAL,
          latitude: '14.123456',
          longitude: '121.123456',
          town_name: 'Test Town 1',
          district_name: 'Test District 1'
        })

      // Assert
      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('Merchant Location Saved')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('id')
      expect(res.body.data).toHaveProperty('merchant')
      expect(res.body.data.merchant).toHaveProperty('id')
      expect(res.body.data.merchant.id).toEqual(merchant.id)

      // Clean up
      await AppDataSource.manager.delete(
        MerchantLocationEntity,
        { id: res.body.data.id }
      )
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: merchant.id }
      )
      await AppDataSource.manager.delete(
        CheckoutCounterEntity,
        { id: checkoutCounter.id }
      )
    })
  })

  describe('POST /api/v1/merchants/:id/contact-persons', () => {
    it('should respond with 201 status when create contact person valid data', async () => {
      // Arrange
      const merchant = await AppDataSource.manager.save(
        MerchantEntity,
        {
          dba_trading_name: 'Test Merchant 1',
          registered_name: 'Test Merchant 1',
          employees_num: NumberOfEmployees.ONE_TO_FIVE,
          monthly_turnover: '0.5',
          currency_code: CurrencyCodes.PHP,
          category_code: '10410',
          payinto_alias: 'merchant1'
        }
      )

      // Act
      const res = await request(app)
        .post(`/api/v1/merchants/${merchant.id}/contact-persons`)
        .send({
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone_number: '1234567890'
        })

      const merchantTest = await AppDataSource.manager.findOneOrFail(
        MerchantEntity,
        {
          where:
          { id: merchant.id },
          relations: ['contact_persons']
        }
      )
      // Assert
      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('message')
      expect(res.body).toHaveProperty('data')

      expect(merchantTest.contact_persons).toHaveLength(1)
      expect(merchantTest.contact_persons[0].name).toEqual('John Doe')
      expect(merchantTest.contact_persons[0].email).toEqual('john.doe@example.com')
      expect(merchantTest.contact_persons[0].phone_number).toEqual('1234567890')

      // Clean up
      await AppDataSource.manager.delete(
        ContactPersonEntity,
        { id: res.body.data.id }
      )
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: merchant.id }
      )
    })

    // eslint-disable-next-line
    it('should respond with 201 status when creating contact person with is_same_as_business_owner=true ', async () => {
      // Arrange
      const businessOwner = await AppDataSource.manager.save(
        BusinessOwnerEntity,
        {
          name: 'test business owner',
          email: 'test_buz_owner@email.com',
          phone_number: '1234567890',
          identificaton_type: BusinessOwnerIDType.NATIONAL_ID,
          identification_number: '1234567890'
        }
      )
      const merchant = await AppDataSource.manager.save(
        MerchantEntity,
        {
          dba_trading_name: 'Test Merchant 1',
          registered_name: 'Test Merchant 1',
          employees_num: NumberOfEmployees.ONE_TO_FIVE,
          monthly_turnover: '0.5',
          currency_code: CurrencyCodes.PHP,
          category_code: '10410',
          payinto_alias: 'merchant1',
          business_owners: [businessOwner]
        }
      )

      // Act
      const res = await request(app)
        .post(`/api/v1/merchants/${merchant.id}/contact-persons`)
        .send({
          is_same_as_business_owner: true
          // No Longer needed!
          // name: '',
          // email: '',
          // phone_number: ''
        })

      const merchantTest = await AppDataSource.manager.findOneOrFail(
        MerchantEntity,
        {
          where:
          { id: merchant.id },
          relations: ['contact_persons']
        }
      )

      // Assert
      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('message')
      expect(res.body).toHaveProperty('data')

      expect(res.body.data).toHaveProperty('name')
      expect(res.body.data.name).toEqual(businessOwner.name)
      expect(res.body.data).toHaveProperty('email')
      expect(res.body.data.email).toEqual(businessOwner.email)
      expect(res.body.data).toHaveProperty('phone_number')
      expect(res.body.data.phone_number).toEqual(businessOwner.phone_number)

      expect(merchantTest.contact_persons.length).toEqual(1)
      expect(merchantTest.contact_persons[0].name).toEqual(businessOwner.name)
      expect(merchantTest.contact_persons[0].email).toEqual(businessOwner.email)
      expect(merchantTest.contact_persons[0].phone_number).toEqual(businessOwner.phone_number)

      // Clean up
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: merchant.id }
      )
      await AppDataSource.manager.delete(
        ContactPersonEntity,
        { id: res.body.data.id }
      )
      await AppDataSource.manager.delete(
        BusinessOwnerEntity,
        { id: businessOwner.id }
      )
    })
  })

  describe('POST /api/v1/merchants/:id/business-owners', () => {
    it('should respond with 201 status and the created business owner', async () => {
      // Arrange
      const merchant = await AppDataSource.manager.save(
        MerchantEntity,
        {
          dba_trading_name: 'Test Merchant 1',
          registered_name: 'Test Merchant 1',
          employees_num: NumberOfEmployees.ONE_TO_FIVE,
          monthly_turnover: '0.5',
          currency_code: 'PHP',
          category_code: '10410'
        }
      )

      const res = await request(app)
        .post(`/api/v1/merchants/${merchant.id}/business-owners`)
        .send({
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone_number: '1234567890',
          identificaton_type: 'National ID',
          identification_number: '123456789',
          country: Countries.Afghanistan,
          street_name: 'Street #1'
        })

      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('message')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('businessPersonLocation')
      expect(res.body.data.businessPersonLocation).toHaveProperty('country')
      expect(res.body.data.businessPersonLocation.country).toEqual(Countries.Afghanistan)
      expect(res.body.data.businessPersonLocation).toHaveProperty('street_name')
      expect(res.body.data.businessPersonLocation.street_name).toEqual('Street #1')

      // Clean up
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: merchant.id }
      )
      await AppDataSource.manager.delete(
        BusinessOwnerEntity,
        { id: res.body.data.id }
      )
    })
  })
})
