/* eslint-disable max-len */
import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { MerchantRegistrationStatus, NumberOfEmployees } from 'shared-lib'

export function testPutMerchantRevertStatus (app: Application): void {
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

  let merchantId = 0
  let nonReadyMerchantId = 0
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
        const res3 = await request(app)
          .post('/api/v1/users/login')
          .send({
            email: differentDFSPUserEmail,
            password: differentDFSPUserPwd
          })
        differentDFSPUserToken = res3.body.token
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
    merchantId = res4.body.data.id

    await request(app)
      .put(`/api/v1/merchants/${merchantId}/ready-to-review`)
      .set('Authorization', `Bearer ${makerToken}`)

    // Prepare non-ready merchant
    const res5 = await request(app)
      .post('/api/v1/merchants/draft')
      .set('Authorization', `Bearer ${makerToken}`)
      .field('dba_trading_name', 'Merchat56')
      .field('registered_name', 'Registered Merchant 56')
      .field('employees_num', NumberOfEmployees.ONE_TO_FIVE)
      .field('monthly_turnover', 0.5)
      .field('currency_code', 'PHP')
      .field('category_code', '10410')
      .field('merchant_type', 'Individual')
      .field('payinto_alias', '000001')
      .field('license_number', '123456789')
    nonReadyMerchantId = res5.body.data.id
  })

  afterAll(async () => {
    // Clean up
    await AppDataSource.manager.delete(MerchantEntity, merchantId)
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app)
      .put('/api/v1/merchants/bulk-revert')
      .send({
        ids: [merchantId]
      })

    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .put('/api/v1/merchants/bulk-revert')
      .set('Authorization', 'Bearer invalid_token')
      .send({
        ids: [merchantId]
      })
    expect(res.statusCode).toEqual(401)
  })

  it('should respond 422 with "Reason is required" message when no reason is provided.', async () => {
    const res = await request(app)
      .put('/api/v1/merchants/bulk-revert')
      .set('Authorization', `Bearer ${makerToken}`)
      .send({
        ids: [merchantId]
      })
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toContain('Reason is required')
  })

  it('should respond 422 with same user cannot revert message when maker trying to revert', async () => {
    const res = await request(app)
      .put('/api/v1/merchants/bulk-revert')
      .set('Authorization', `Bearer ${makerToken}`)
      .send({
        ids: [merchantId],
        reason: 'Reverted'
      })
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toContain('cannot be reverted by the same user who submitted it.')
  })

  it('should respond 422 with not in review status message when merchant is not in review status', async () => {
    const res = await request(app)
      .put('/api/v1/merchants/bulk-revert')
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({
        ids: [nonReadyMerchantId],
        reason: 'Reverted'
      })
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toContain('is not in Review Status')
  })

  it('should respond 422 with not same dfsp message when merchant is not in review status', async () => {
    const res = await request(app)
      .put('/api/v1/merchants/bulk-revert')
      .set('Authorization', `Bearer ${differentDFSPUserToken}`)
      .send({
        ids: [merchantId],
        reason: 'Reverted'
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Accessing different DFSP\'s Merchant is not allowed.')
  })

  it('should respond 200 with Status Updated to "Reverted" for multiple merchants message when everything is valid.', async () => {
    const res = await request(app)
      .put('/api/v1/merchants/bulk-revert')
      .set('Authorization', `Bearer ${checkerToken}`)
      .send({
        ids: [merchantId],
        reason: 'Reverted'
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Status Updated to "Reverted" for multiple merchants')

    const isReverted = await AppDataSource.manager.exists(MerchantEntity, {
      where: { id: merchantId, registration_status: MerchantRegistrationStatus.REVERTED }
    })
    expect(isReverted).toEqual(true)
  })
}
