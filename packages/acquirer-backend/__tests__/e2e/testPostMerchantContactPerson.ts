import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { BusinessOwnerIDType, NumberOfEmployees } from 'shared-lib'
import { ContactPersonEntity } from '../../src/entity/ContactPersonEntity'
import { BusinessOwnerEntity } from '../../src/entity/BusinessOwnerEntity'

export function testPostMerchantContactPerson (app: Application): void {
  let token = ''
  let validMerchantId = 0
  const nonExistingMerchantId = 99999

  const dfspUserEmail = DefaultDFSPUsers[0].email
  const dfspUserPwd = DefaultDFSPUsers[0].password
  const dfspUserDFSPName = DefaultDFSPUsers[0].dfsp_name

  let differentDFSPUserToken = ''
  let differentDFSPUserEmail = ''
  let differentDFSPUserPwd = ''
  let unauthorizedMerchantId = 0

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: dfspUserPwd
      })
    token = res.body.token

    const res2 = await request(app)
      .post('/api/v1/merchants/draft')
      .set('Authorization', `Bearer ${token}`)
      .field('dba_trading_name', 'Merchant170')
      .field('registered_name', 'Registered Merchant 170')
      .field('employees_num', NumberOfEmployees.ONE_TO_FIVE)
      .field('monthly_turnover', 0.5)
      .field('currency_code', 'PHP')
      .field('category_code', '10410')
      .field('merchant_type', 'Individual')
      .field('license_number', '123456789')
    validMerchantId = res2.body.data.id

    // find different dfsp user
    for (const user of DefaultDFSPUsers) {
      if (user.dfsp_name !== dfspUserDFSPName) {
        differentDFSPUserEmail = user.email
        differentDFSPUserPwd = user.password

        const res3 = await request(app)
          .post('/api/v1/users/login')
          .send({
            email: differentDFSPUserEmail,
            password: differentDFSPUserPwd
          })
        differentDFSPUserToken = res3.body.token

        const res4 = await request(app)
          .post('/api/v1/merchants/draft')
          .set('Authorization', `Bearer ${differentDFSPUserToken}`)
          .field('dba_trading_name', 'Merchat77')
          .field('registered_name', 'Registered Merchant 55')
          .field('employees_num', NumberOfEmployees.ONE_TO_FIVE)
          .field('monthly_turnover', 0.5)
          .field('currency_code', 'PHP')
          .field('category_code', '10410')
          .field('merchant_type', 'Individual')
          .field('license_number', '123456789')
        unauthorizedMerchantId = res4.body.data.id
        break
      }
    }
  })

  afterAll(async () => {
    // Clean up
    const merchantRepository = AppDataSource.getRepository(MerchantEntity)
    // await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0;')
    await merchantRepository.delete({ id: validMerchantId })
    await merchantRepository.delete({ id: unauthorizedMerchantId })
    // await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1;')
  })

  it('should respond with 401 status when Authorization header is missing', async () => {
    const res = await request(app).post(`/api/v1/merchants/${validMerchantId}/contact-persons`)
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 status when Authorization token is invalid', async () => {
    const res = await request(app)
      .post(`/api/v1/merchants/${validMerchantId}/contact-persons`)
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 422 status when id is not a number', async () => {
    const res = await request(app)
      .post('/api/v1/merchants/invalid/contact-persons')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid ID')
  })

  it('should respond with 422 status when id is less than 1', async () => {
    const res = await request(app)
      .post('/api/v1/merchants/0/contact-persons')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid ID')
  })

  it('should respond with 404 status when merchant does not exist', async () => {
    const res = await request(app)
      .post(`/api/v1/merchants/${nonExistingMerchantId}/contact-persons`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Merchant not found')
  })

  it('should respond with 400 status when user is not authorized to access the merchant', async () => {
    // You need to setup a merchant ID that the test user should not have access to.
    const res = await request(app)
      .post(`/api/v1/merchants/${unauthorizedMerchantId}/contact-persons`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Accessing different DFSP\'s Merchant is not allowed.')
  })

  it('should respond with 404 status when business owner does not exist when is_same_as_business_owner=true', async () => {
    // Arrange
    const merchant = await AppDataSource.manager.findOneOrFail(MerchantEntity, { where: { id: validMerchantId } })
    merchant.business_owners = []
    await AppDataSource.manager.save(merchant)

    // Act
    const res = await request(app)
      .post(`/api/v1/merchants/${validMerchantId}/contact-persons`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        is_same_as_business_owner: true
      })

    // Assert
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Business Owner not found')
  })

  it('should respond with 422 status when submitted data is invalid', async () => {
    // Act
    const res = await request(app)
      .post(`/api/v1/merchants/${validMerchantId}/contact-persons`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        // name and phone_number are required
        email: 'invalid-email-format',
        is_same_as_business_owner: 'yes' // should be boolean
      })

    // Assert
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual([
      'Required',
      'Required',
      'Invalid email',
      'Expected boolean, received string'
    ])
  })

  it('should respond 201 with Contact Person Saved message', async () => {
    const res = await request(app)
      .post(`/api/v1/merchants/${validMerchantId}/contact-persons`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone_number: '3333-3333-3333'
      })

    // Assert
    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Contact Person Saved')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Object)

    expect(res.body.data).toHaveProperty('id')

    expect(res.body.data).toHaveProperty('name')
    expect(res.body.data.name).toEqual('John Doe')

    expect(res.body.data).toHaveProperty('email')
    expect(res.body.data.email).toEqual('john.doe@example.com')

    // Clean up
    // await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0;')
    await AppDataSource.manager.getRepository(ContactPersonEntity).delete({ id: res.body.data.id })
    // await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1;')
  })

  it('should respond 201 with Contact Person Saved message with is_same_as_business_owner=true', async () => {
    // Arrange

    const merchant = await AppDataSource.manager.findOne(MerchantEntity, { where: { id: validMerchantId } })
    const owner = AppDataSource.manager.create(BusinessOwnerEntity, {
      identification_number: '12345',
      identificaton_type: BusinessOwnerIDType.NATIONAL_ID,
      name: 'Owner John',
      email: 'owner-john@email.com',
      phone_number: '555-555-55555',
      merchants: [merchant as MerchantEntity]
    })
    await AppDataSource.manager.save(owner)

    // Act
    const res = await request(app)
      .post(`/api/v1/merchants/${validMerchantId}/contact-persons`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        is_same_as_business_owner: true
      })

    // Assert
    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Contact Person Saved')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Object)

    expect(res.body.data).toHaveProperty('id')

    expect(res.body.data).toHaveProperty('name')
    expect(res.body.data.name).toEqual('Owner John')

    expect(res.body.data).toHaveProperty('email')
    expect(res.body.data.email).toEqual('owner-john@email.com')

    // Clean up
    // await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0;')
    await AppDataSource.manager.getRepository(ContactPersonEntity).delete({ id: res.body.data.id })
    // await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1;')
  })
}
