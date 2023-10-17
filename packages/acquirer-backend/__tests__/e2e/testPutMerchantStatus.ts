/* eslint-disable max-len */
import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { MerchantRegistrationStatus, NumberOfEmployees } from 'shared-lib'

export function testPutMerchantStatusReadyToReview (app: Application): void {
  let makerToken = ''
  const dfspMakerUserEmail = DefaultDFSPUsers[0].email
  const dfspMakerUserPwd = DefaultDFSPUsers[0].password
  const makerDFSPName = DefaultDFSPUsers[0].dfsp_name

  let checkerToken = ''
  const dfspCheckerUserEmail = DefaultDFSPUsers[1].email
  const dfspCheckerUserPwd = DefaultDFSPUsers[1].password
  // const checkerDFSPName = DefaultDFSPUsers[1].dfsp_name

  let differentDFSPUserToken = ''
  let differentDFSPUserEmail = ''
  let differentDFSPUserPwd = ''

  let draftedMerchantId = 0
  beforeAll(async () => {
    // Arrange
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspMakerUserEmail,
        password: dfspMakerUserPwd
      })
    makerToken = res.body.token

    const res2 = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspCheckerUserEmail,
        password: dfspCheckerUserPwd
      })
    checkerToken = res2.body.token

    // find different dfsp user
    for (const user of DefaultDFSPUsers) {
      if (user.dfsp_name !== makerDFSPName) {
        differentDFSPUserEmail = user.email
        differentDFSPUserPwd = user.password
        break
      }
    }

    const res3 = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: differentDFSPUserEmail,
        password: differentDFSPUserPwd
      })
    differentDFSPUserToken = res3.body.token

    const res4 = await request(app)
      .post('/api/v1/merchants/draft')
      .set('Authorization', `Bearer ${makerToken}`)
      .field('dba_trading_name', 'Merchat55')
      .field('registered_name', 'Registered Merchant 55')
      .field('employees_num', NumberOfEmployees.ONE_TO_FIVE)
      .field('monthly_turnover', 0.5)
      .field('currency_code', 'PHP')
      .field('category_code', '10410')
      .field('merchant_type', 'Individual')
      .field('payinto_alias', '000001')
      .field('license_number', '123456789')
    draftedMerchantId = res4.body.data.id
  })

  afterAll(async () => {
    // Clean up
    await AppDataSource.manager.delete(MerchantEntity, draftedMerchantId)
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app).put(`/api/v1/merchants/${draftedMerchantId}/ready-to-review`)
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${draftedMerchantId}/ready-to-review`)
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 404 when Merchant is not found', async () => {
    const res = await request(app)
      .put('/api/v1/merchants/999999/ready-to-review')
      .set('Authorization', `Bearer ${makerToken}`)
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Merchant not found')
  })

  it('should respond with 400 with "Accessing different DFSP\'s Merchant is not allowed." message when User and Merchant DFSP are different ', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${draftedMerchantId}/ready-to-review`)
      .set('Authorization', `Bearer ${differentDFSPUserToken}`)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Accessing different DFSP\'s Merchant is not allowed.')
  })

  it('should respond with 401 with "Only submitter can mark as Review"', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${draftedMerchantId}/ready-to-review`)
      .set('Authorization', `Bearer ${checkerToken}`)

    expect(res.statusCode).toEqual(401)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Only the DFSP User who submitted the Draft Merchant can mark it as Review')
  })

  // res.status(200).send({ message: 'Status Updated to Review', data: merchantData })
  it('should respond with 200 with "Status Updated to Review" message when everything is valid.', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${draftedMerchantId}/ready-to-review`)
      .set('Authorization', `Bearer ${makerToken}`)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Status Updated to Review')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('registration_status')
    expect(res.body.data.registration_status).toEqual(MerchantRegistrationStatus.REVIEW)
  })
}
