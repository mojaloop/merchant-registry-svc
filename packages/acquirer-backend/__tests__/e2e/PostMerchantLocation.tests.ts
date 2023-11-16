import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { NumberOfEmployees } from 'shared-lib'
import { MerchantLocationEntity } from '../../src/entity/MerchantLocationEntity'

export function testPostMerchantLocations (app: Application): void {
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
    const res = await request(app).post(`/api/v1/merchants/${validMerchantId}/locations`)
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 status when Authorization token is invalid', async () => {
    const res = await request(app)
      .post(`/api/v1/merchants/${validMerchantId}/locations`)
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 422 status when id is not a number', async () => {
    const res = await request(app)
      .post('/api/v1/merchants/invalid/locations')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid ID')
  })

  it('should respond with 422 status when id is less than 1', async () => {
    const res = await request(app)
      .post('/api/v1/merchants/0/locations')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid ID')
  })

  it('should respond with 404 status when merchant does not exist', async () => {
    const res = await request(app)
      .post(`/api/v1/merchants/${nonExistingMerchantId}/locations`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Merchant not found')
  })

  it('should respond with 400 status when user is not authorized to access the merchant', async () => {
    // You need to setup a merchant ID that the test user should not have access to.
    const res = await request(app)
      .post(`/api/v1/merchants/${unauthorizedMerchantId}/locations`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Accessing different DFSP\'s Merchant is not allowed.')
  })

  it('should respond 422 with Validation Error when Location Type is invalid', async () => {
    const res = await request(app)
      .post(`/api/v1/merchants/${validMerchantId}/locations`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        location_type: 'nonexistent-location-type',
        web_url: 'http://www.example.com',
        address_type: 'Office',
        department: 'Sales'
      })

    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual([
      "Invalid enum value. Expected 'Physical' | 'Virtual', received 'nonexistent-location-type'"
    ])
  })

  it('should respond with 201 status and valid location data when everything is valid', async () => {
    const res = await request(app)
      .post(`/api/v1/merchants/${validMerchantId}/locations`)
      .set('Authorization', `Bearer ${token}`)
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

    // Assert
    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Merchant Location Saved')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Object)

    expect(res.body.data).toHaveProperty('id')
    expect(res.body.data).toHaveProperty('merchant')

    expect(res.body.data.merchant).toHaveProperty('id')
    expect(res.body.data.merchant.id).toEqual(validMerchantId)

    expect(res.body.data).toHaveProperty('location_type')
    expect(res.body.data.location_type).toEqual('Physical')

    expect(res.body.data).toHaveProperty('web_url')
    expect(res.body.data.web_url).toEqual('http://www.example.com')

    expect(res.body.data).toHaveProperty('address_type')
    expect(res.body.data.address_type).toEqual('Office')

    expect(res.body.data).toHaveProperty('department')
    expect(res.body.data.department).toEqual('Sales')

    expect(res.body.data).toHaveProperty('sub_department')
    expect(res.body.data.sub_department).toEqual('Support')

    expect(res.body.data).toHaveProperty('street_name')
    expect(res.body.data.street_name).toEqual('Main Street')

    expect(res.body.data).toHaveProperty('building_number')
    expect(res.body.data.building_number).toEqual('123')

    expect(res.body.data).toHaveProperty('building_name')
    expect(res.body.data.building_name).toEqual('Big Building')

    expect(res.body.data).toHaveProperty('floor_number')
    expect(res.body.data.floor_number).toEqual('4')

    expect(res.body.data).toHaveProperty('room_number')
    expect(res.body.data.room_number).toEqual('101')

    expect(res.body.data).toHaveProperty('post_box')
    expect(res.body.data.post_box).toEqual('PO Box 123')

    expect(res.body.data).toHaveProperty('postal_code')
    expect(res.body.data.postal_code).toEqual('12345')

    expect(res.body.data).toHaveProperty('town_name')
    expect(res.body.data.town_name).toEqual('Townsville')

    expect(res.body.data).toHaveProperty('district_name')
    expect(res.body.data.district_name).toEqual('District 1')

    expect(res.body.data).toHaveProperty('country_subdivision')
    expect(res.body.data.country_subdivision).toEqual('State')

    expect(res.body.data).toHaveProperty('country')
    expect(res.body.data.country).toEqual('United States of America')

    expect(res.body.data).toHaveProperty('address_line')
    expect(res.body.data.address_line).toEqual('123 Main Street, Townsville')

    expect(res.body.data).toHaveProperty('latitude')
    expect(res.body.data.latitude).toEqual('40.7128')

    expect(res.body.data).toHaveProperty('longitude')
    expect(res.body.data.longitude).toEqual('74.0060')

    // Clean up
    // await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0;')
    await AppDataSource.manager.getRepository(MerchantLocationEntity).delete({ id: res.body.data.id })
    // await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1;')
  })
}
