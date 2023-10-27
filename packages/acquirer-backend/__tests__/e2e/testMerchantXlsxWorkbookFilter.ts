/* eslint-disable max-len */
import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { NumberOfEmployees } from 'shared-lib'

export function testGETMerchantXlsxWorkbookFilter (app: Application): void {
  let dfspUserToken = ''
  const dfspUserEmail = DefaultDFSPUsers[0].email
  const dfspUserPwd = DefaultDFSPUsers[0].password

  let merchantId = 0
  const nonReadyMerchantId = 0
  beforeAll(async () => {
    // Arrange
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: dfspUserPwd
      })
    dfspUserToken = res.body.token

    const res4 = await request(app)
      .post('/api/v1/merchants/draft')
      .set('Authorization', `Bearer ${dfspUserToken}`)
      .field('dba_trading_name', 'Merchat55')
      .field('registered_name', 'Registered Merchant 55')
      .field('employees_num', NumberOfEmployees.ONE_TO_FIVE)
      .field('monthly_turnover', 0.5)
      .field('currency_code', 'PHP')
      .field('category_code', '10410')
      .field('merchant_type', 'Individual')
      .field('license_number', '123456789')
    merchantId = res4.body.data.id
  })

  afterAll(async () => {
    // Clean up
    await AppDataSource.manager.delete(MerchantEntity, merchantId)
    await AppDataSource.manager.delete(MerchantEntity, nonReadyMerchantId)
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app)
      .get('/api/v1/merchants/export-with-filter')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .get('/api/v1/merchants/export-with-filter')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 200 with xlsx file', async () => {
    const res = await request(app)
      .get('/api/v1/merchants/export-with-filter')
      .set('Authorization', `Bearer ${dfspUserToken}`)

    expect(res.statusCode).toEqual(200)
    expect(res.headers['content-type']).toEqual('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    expect(res.headers['content-disposition']).toEqual('attachment; filename=merchants.xlsx')
    expect(res.body).toBeDefined()
  })
}
