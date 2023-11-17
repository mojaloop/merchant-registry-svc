import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { NumberOfEmployees } from 'shared-lib'

export function testGetMerchantDraftCounts (app: Application): void {
  let token = ''
  let validMerchantId = 0

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
    const res2 = await request(app)
      .post('/api/v1/merchants/draft')
      .set('Authorization', `Bearer ${token}`)
      .field('dba_trading_name', 'Merchant80')
      .field('registered_name', 'Registered Merchant 80')
      .field('employees_num', NumberOfEmployees.ONE_TO_FIVE)
      .field('monthly_turnover', 0.5)
      .field('currency_code', 'PHP')
      .field('category_code', '10410')
      .field('merchant_type', 'Individual')
      .field('license_number', '123456789')
    validMerchantId = res2.body.data.id
  })

  afterAll(async () => {
    // Clean up
    const merchantRepository = AppDataSource.getRepository(MerchantEntity)
    await merchantRepository.delete({ id: validMerchantId })
    await merchantRepository.delete({ id: unauthorizedMerchantId })
  })

  it('should respond with 401 status when Authorization header is missing', async () => {
    const res = await request(app).get('/api/v1/merchants/draft-counts')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 status when Authorization token is invalid', async () => {
    const res = await request(app)
      .get('/api/v1/merchants/draft-counts')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond 200 status with Draft Counts when everything is valid', async () => {
    const res = await request(app)
      .get('/api/v1/merchants/draft-counts')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('OK')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeGreaterThanOrEqual(1)
  })
}
