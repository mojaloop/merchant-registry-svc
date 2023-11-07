import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { NumberOfEmployees } from 'shared-lib'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'

export function testGetMerchantById (app: Application): void {
  let token = ''
  let validMerchantId = 0
  const nonExistingMerchantId = 99999

  const dfspUserEmail = DefaultDFSPUsers[0].email
  const dfspUserPwd = DefaultDFSPUsers[0].password
  const dfspUserDFSPName = DefaultDFSPUsers[0].dfsp_name

  const dfspCheckerUserEmail = DefaultDFSPUsers[1].email

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
      .field('dba_trading_name', 'Merchat70')
      .field('registered_name', 'Registered Merchant 55')
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
    await merchantRepository.delete({ id: validMerchantId })
    await merchantRepository.delete({ id: unauthorizedMerchantId })
  })

  it('should respond with 401 status when Authorization header is missing', async () => {
    const res = await request(app).get(`/api/v1/merchants/${validMerchantId}`)
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 status when Authorization token is invalid', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/${validMerchantId}`)
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 422 status when id is not a number', async () => {
    const res = await request(app)
      .get('/api/v1/merchants/invalid')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid ID')
  })

  it('should respond with 422 status when id is less than 1', async () => {
    const res = await request(app)
      .get('/api/v1/merchants/0')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid ID')
  })

  it('should respond with 404 status when merchant does not exist', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/${nonExistingMerchantId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Merchant not found')
  })

  it('should respond with 400 status when user is not authorized to access the merchant', async () => {
    // You need to setup a merchant ID that the test user should not have access to.
    const res = await request(app)
      .get(`/api/v1/merchants/${unauthorizedMerchantId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Accessing different DFSP\'s Merchant is not allowed.')
  })

  it('should respond with 200 status and valid merchant data when everything is valid', async () => {
    // Act
    const res = await request(app)
      .get(`/api/v1/merchants/${validMerchantId}`)
      .set('Authorization', `Bearer ${token}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('OK')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Object)
  })

  it('should respond 200 status and valid merchant data with checked_by property when merchant is checked', async () => {
    // Arrange
    const checker = await AppDataSource.manager.findOne(PortalUserEntity, { where: { email: dfspCheckerUserEmail } }) as PortalUserEntity
    await AppDataSource.manager.update(MerchantEntity, { id: validMerchantId }, { checked_by: checker })

    // Act
    const res = await request(app)
      .get(`/api/v1/merchants/${validMerchantId}`)
      .set('Authorization', `Bearer ${token}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('OK')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Object)
    expect(res.body.data).toHaveProperty('checked_by')
    expect(res.body.data.checked_by).toBeInstanceOf(Object)
    expect(res.body.data.checked_by).toHaveProperty('id')
    expect(res.body.data.checked_by).toHaveProperty('email')
    expect(res.body.data.checked_by.email).toEqual(dfspCheckerUserEmail)
    expect(res.body.data.checked_by.password).toBeUndefined() // password should not be returned
  })
}
