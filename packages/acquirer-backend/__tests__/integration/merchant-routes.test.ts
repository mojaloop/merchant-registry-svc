import request from 'supertest'
import express from 'express'
import merchant_router from '../../src/routes/merchant-routes'
import { AppDataSource } from '../../src/database/data-source'
import logger from '../../src/logger'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { initializeDatabase } from '../../src/database/init-database'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { ContactPersonEntity } from '../../src/entity/ContactPersonEntity'
import { BusinessOwnerEntity } from '../../src/entity/BusinessOwnerEntity'
import { MerchantRegistrationStatus, NumberOfEmployees } from 'shared-lib'
import { CheckoutCounterEntity } from '../../src/entity/CheckoutCounterEntity'
import { BusinessLicenseEntity } from '../../src/entity/BusinessLicenseEntity'

const app = express()
app.use(express.json())
app.use('/api/v1', merchant_router)

logger.silent = true

describe('Merchant Routes Tests', () => {
  beforeAll(async () => {
    await initializeDatabase()
  })

  afterAll(async () => {
    await AppDataSource.destroy()
  })

  describe('POST /api/v1/merchants/submit', () => {
    beforeEach(async () => {
      await AppDataSource.manager.delete(BusinessLicenseEntity, {})
      await AppDataSource.manager.delete(CheckoutCounterEntity, {})

      await AppDataSource.manager.delete(MerchantEntity, {})
    })
    it('should respond with 201 status and the created merchant', async () => {
      // Arrange

      // Act
      const res = await request(app)
        .post('/api/v1/merchants/submit')
        .set('Authorization', `Bearer ${process.env.TEST1_DUMMY_AUTH_TOKEN ?? ''}`)
        .send({
          dba_trading_name: 'Test Merchant 1',
          registered_name: 'Test Merchant 1',
          employees_num: '1 - 5',
          monthly_turnover: 0.5,
          currency_code: 'PHP',
          category_code: '10410',
          payinto_alias: 'P33',
          registration_status: MerchantRegistrationStatus.DRAFT,
          registration_status_reason: 'Drafting Merchant',
          business_licenses: [
            {
              license_number: '007',
              license_document_link: 'https://www.africau.edu/images/default/sample.pdf'
            },
            {
              license_number: '001',
              license_document_link: 'https://www.africau.edu/images/default/sample.pdf'
            }
          ]
        })

      // Assert
      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('Drafting Merchant Successful')
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('id')

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
          monthly_turnover: 0.5,
          currency_code: 'PHP',
          category_code: '10410',
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
      // Assert
      //

      // Clean up
    })
  })

  describe('POST /api/v1/merchants/:id/contact-persons', () => {
    it('should respond with 201 status and the created contact person', async () => {
      // Arrange
      const merchant = await AppDataSource.manager.save(
        MerchantEntity,
        {
          dba_trading_name: 'Test Merchant 1',
          registered_name: 'Test Merchant 1',
          employees_num: NumberOfEmployees.ONE_TO_FIVE,
          monthly_turnover: 0.5,
          currency_code: 'PHP',
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

      // Assert
      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('message')
      expect(res.body).toHaveProperty('data')

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
          monthly_turnover: 0.5,
          currency_code: 'PHP',
          category_code: '10410',
          payinto_alias: 'merchant1'
        }
      )

      const res = await request(app)
        .post(`/api/v1/merchants/${merchant.id}/business-owners`)
        .send({
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone_number: '1234567890',
          identificaton_type: 'National ID',
          identification_number: '123456789'
        })

      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('message')
      expect(res.body).toHaveProperty('data')

      // Clean up
      await AppDataSource.manager.delete(
        BusinessOwnerEntity,
        { id: res.body.data.id }
      )
      await AppDataSource.manager.delete(
        MerchantEntity,
        { id: merchant.id }
      )
    })
  })
})
