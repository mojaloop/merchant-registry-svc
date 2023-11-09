/* eslint-disable max-len */
import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { BusinessOwnerIDType, NumberOfEmployees } from 'shared-lib'
import { MerchantLocationEntity } from '../../src/entity/MerchantLocationEntity'
import { BusinessOwnerEntity } from '../../src/entity/BusinessOwnerEntity'
import { ContactPersonEntity } from '../../src/entity/ContactPersonEntity'

export function testGETMerchantXlsxWorkbook (app: Application): void {
  let dfspUserToken = ''
  const dfspUserEmail = DefaultDFSPUsers[0].email
  const dfspUserPwd = DefaultDFSPUsers[0].password
  const dfspName = DefaultDFSPUsers[0].dfsp_name

  let differentDFSPUserToken = ''
  let differentDFSPUserEmail = ''
  let differentDFSPUserPwd = ''

  let merchantId = 0
  let locationId = 0
  let businessOwnerId = 0
  let contactPersonId = 0

  let nonReadyMerchantId = 0
  beforeAll(async () => {
    // Arrange
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: dfspUserPwd
      })
    dfspUserToken = res.body.token

    // find different dfsp user
    for (const user of DefaultDFSPUsers) {
      if (user.dfsp_name !== dfspName) {
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

    let res4 = await request(app)
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

    // This should export the location data
    res4 = await request(app)
      .post(`/api/v1/merchants/${merchantId}/locations`)
      .set('Authorization', `Bearer ${dfspUserToken}`)
      .send({
        location_type: 'Physical',
        web_url: 'http://www.example.com',
        address_type: 'Office',
        department: 'Sales',
        sub_department: 'Support',
        street_name: 'Main Street',
        building_number: '123',
        building_name: 'Big Building',
        floor_number: '4',
        room_number: '101',
        post_box: 'PO Box 123',
        postal_code: '12345',
        town_name: 'Townsville',
        district_name: 'District 1',
        country_subdivision: 'State',
        country: 'United States of America',
        address_line: '123 Main Street, Townsville',
        latitude: '40.7128',
        longitude: '74.0060'
      })
    locationId = res4.body.data.id

    // This should export the business owner data
    res4 = await request(app)
      .post(`/api/v1/merchants/${merchantId}/business-owners`)
      .set('Authorization', `Bearer ${dfspUserToken}`)
      .send({
        identificaton_type: BusinessOwnerIDType.NATIONAL_ID,
        identification_number: '123456789',
        name: 'John Doe Owner',
        email: 'john.doe.owner@example.com',
        phone_number: '3333-3333-3333'
      })
    businessOwnerId = res4.body.data.id

    // This should export the contact person data
    res4 = await request(app)
      .post(`/api/v1/merchants/${merchantId}/contact-persons`)
      .set('Authorization', `Bearer ${dfspUserToken}`)
      .send({
        name: 'John Doe',
        email: 'joe.doe-export.merchant@example.com',
        phone_number: '3333-3333-3333'
      })
    contactPersonId = res4.body.data.id

    await request(app)
      .put(`/api/v1/merchants/${merchantId}/ready-to-review`)
      .set('Authorization', `Bearer ${dfspUserToken}`)

    // Prepare non-ready merchant
    const res5 = await request(app)
      .post('/api/v1/merchants/draft')
      .set('Authorization', `Bearer ${dfspUserToken}`)
      .field('dba_trading_name', 'Merchat56')
      .field('registered_name', 'Registered Merchant 56')
      .field('employees_num', NumberOfEmployees.ONE_TO_FIVE)
      .field('monthly_turnover', 0.5)
      .field('currency_code', 'PHP')
      .field('category_code', '10410')
      .field('merchant_type', 'Individual')
      .field('license_number', '123456789')
    nonReadyMerchantId = res5.body.data.id
  })

  afterAll(async () => {
    // Clean up
    //
    await AppDataSource.query('PRAGMA foreign_keys = OFF;')
    await AppDataSource.manager.delete(MerchantEntity, merchantId)
    await AppDataSource.manager.delete(MerchantEntity, nonReadyMerchantId)
    await AppDataSource.manager.delete(MerchantLocationEntity, locationId)
    await AppDataSource.manager.delete(BusinessOwnerEntity, businessOwnerId)
    await AppDataSource.manager.delete(ContactPersonEntity, contactPersonId)
    await AppDataSource.query('PRAGMA foreign_keys = ON;')
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/export-with-ids?ids=${merchantId},${nonReadyMerchantId}`)
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/export-with-ids?ids=${merchantId},${nonReadyMerchantId}`)
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 422 when ids is not provided', async () => {
    const res = await request(app)
      .get('/api/v1/merchants/export-with-ids')
      .set('Authorization', `Bearer ${dfspUserToken}`)
    expect(res.statusCode).toEqual(422)
  })

  it('should respond with 422 when ids is not array of numbers', async () => {
    const res = await request(app)
      .get('/api/v1/merchants/export-with-ids?ids=1ab,asdf,3cc')
      .set('Authorization', `Bearer ${dfspUserToken}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toContain('Each ID in the array must be a valid ID number.')
  })

  it('should respond with 400 when user is trying to access different DFSP\'s Merchant', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/export-with-ids?ids=${merchantId},${nonReadyMerchantId}`)
      .set('Authorization', `Bearer ${differentDFSPUserToken}`)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toContain('Accessing different DFSP\'s Merchant is not allowed.')
  })

  it('should respond with 200 with xlsx file with comma separated ids string', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/export-with-ids?ids=${merchantId},${nonReadyMerchantId}`)
      .set('Authorization', `Bearer ${dfspUserToken}`)

    expect(res.statusCode).toEqual(200)
    expect(res.headers['content-type']).toEqual('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    expect(res.headers['content-disposition']).toEqual('attachment; filename=merchants.xlsx')
    expect(res.body).toBeDefined()
  })

  it('should respond with 200 with xlsx file with id array', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/export-with-ids?ids=${merchantId}&ids=${nonReadyMerchantId}`)
      .set('Authorization', `Bearer ${dfspUserToken}`)

    expect(res.statusCode).toEqual(200)
    expect(res.headers['content-type']).toEqual('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    expect(res.headers['content-disposition']).toEqual('attachment; filename=merchants.xlsx')
    expect(res.body).toBeDefined()
  })
}
