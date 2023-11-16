/* eslint-disable max-len */

import {
  removeMerchantDocument
} from '../../src/services/S3Client'
import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import fs from 'fs'
import path from 'path'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { MerchantRegistrationStatus } from 'shared-lib'

export function testPostMerchantDraft (app: Application): void {
  let token = ''
  const dfspUserEmail = DefaultDFSPUsers[0].email
  const dfspUserPwd = DefaultDFSPUsers[0].password

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: dfspUserPwd
      })
    token = res.body.token
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app).post('/api/v1/merchants/draft')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/merchants/draft')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond 422 with Validation Errors', async () => {
    const res = await request(app)
      .post('/api/v1/merchants/draft')
      .set('Authorization', `Bearer ${token}`)
      .field('merchant_type', 'non-existing-merchant-type')

    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toHaveLength(1)
    expect(res.body.message[0]).toContain('merchant_type: Invalid enum value.')
  })

  it('should respond with 201 and merchant data when everything is valid with Draft status', async () => {
    const res = await request(app)
      .post('/api/v1/merchants/draft')
      .set('Authorization', `Bearer ${token}`)
      .field('dba_trading_name', 'Some Trading Name')
      .field('registered_name', 'Some Registered Name')
      .field('employees_num', '1 - 5')
      .field('monthly_turnover', 0.5)
      .field('currency_code', 'PHP')
      .field('category_code', '10410')
      .field('merchant_type', 'Individual')
      .field('payinto_alias', 'merchant1')
      .field('license_number', '123456789')

    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Drafting Merchant Successful')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('id')
    expect(res.body.data).toHaveProperty('registration_status')
    expect(res.body.data.registration_status).toEqual(MerchantRegistrationStatus.DRAFT)

    // Clean up
    await AppDataSource.manager.delete(MerchantEntity, res.body.data.id)
  })

  it('should respond with 201 and merchant data when everything is valid with license_document file with Draft status', async () => {
    const filePath = path.resolve(__dirname, '../test-files/dummy.pdf')
    const res = await request(app)
      .post('/api/v1/merchants/draft')
      .set('Authorization', `Bearer ${token}`)
      .field('dba_trading_name', 'Some Trading Name')
      .field('registered_name', 'Some Registered Name')
      .field('employees_num', '1 - 5')
      .field('monthly_turnover', 0.5)
      .field('currency_code', 'PHP')
      .field('category_code', '10410')
      .field('merchant_type', 'Individual')
      .field('payinto_alias', 'merchant1')
      .field('license_number', '111111')
      .attach('license_document', fs.createReadStream(filePath), { filename: 'dummy.pdf' })

    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Drafting Merchant Successful')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('id')
    expect(res.body.data).toHaveProperty('business_licenses')
    expect(res.body.data).toHaveProperty('registration_status')
    expect(res.body.data.registration_status).toEqual(MerchantRegistrationStatus.DRAFT)
    expect(res.body.data.business_licenses).toHaveLength(1)
    expect(res.body.data.business_licenses[0]).toHaveProperty('id')
    expect(res.body.data.business_licenses[0]).toHaveProperty('license_number')
    expect(res.body.data.business_licenses[0]).toHaveProperty('license_document_link')
    expect(res.body.data.business_licenses[0].license_document_link).toContain('dummy')

    // Clean up
    await removeMerchantDocument(res.body.data.business_licenses[0].license_document_link)
    await AppDataSource.manager.delete(MerchantEntity, res.body.data.id)
  })
}
