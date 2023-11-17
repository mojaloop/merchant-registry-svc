import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { NumberOfEmployees } from 'shared-lib'
import { MerchantLocationEntity } from '../../src/entity/MerchantLocationEntity'

export function testGetMerchantLocations (app: Application): void {
  let token = ''
  let validMerchantId = 0
  let merchantLocationId = 0
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

    const res3 = await request(app)
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
        longitude: '74.0060',
        checkout_description: 'Checkout Description for Merchant 80'
      })

    merchantLocationId = res3.body.data.id
  })

  afterAll(async () => {
    // Clean up
    const merchantRepository = AppDataSource.getRepository(MerchantEntity)
    const locationRepository = AppDataSource.getRepository(MerchantLocationEntity)
    await locationRepository.delete({ id: merchantLocationId })
    await merchantRepository.delete({ id: validMerchantId })
    await merchantRepository.delete({ id: unauthorizedMerchantId })
  })

  it('should respond with 401 status when Authorization header is missing', async () => {
    const res = await request(app).get(`/api/v1/merchants/${validMerchantId}/locations`)
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 status when Authorization token is invalid', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/${validMerchantId}/locations`)
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 422 status when id is not a number', async () => {
    const res = await request(app)
      .get('/api/v1/merchants/invalid/locations')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid ID')
  })

  it('should respond with 422 status when id is less than 1', async () => {
    const res = await request(app)
      .get('/api/v1/merchants/0/locations')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid ID')
  })

  it('should respond with 404 status when merchant does not exist', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/${nonExistingMerchantId}/locations`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(404)
  })

  it('should respond with 400 status when user is not authorized to access the merchant', async () => {
    // You need to setup a merchant ID that the test user should not have access to.
    const res = await request(app)
      .get(`/api/v1/merchants/${unauthorizedMerchantId}/locations`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Accessing different DFSP\'s Merchant is not allowed.')
  })

  it('should respond with 200 status and valid merchant data when everything is valid', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/${validMerchantId}/locations`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('OK')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)

    const location = res.body.data[0]
    expect(location).toHaveProperty('id')
    expect(location.id).toBeGreaterThan(0)

    expect(location).toHaveProperty('location_type')
    expect(location.location_type).toEqual('Physical')

    expect(location).toHaveProperty('web_url')
    expect(location.web_url).toEqual('http://www.example.com')

    expect(location).toHaveProperty('address_type')
    expect(location.address_type).toEqual('Office')

    expect(location).toHaveProperty('department')
    expect(location.department).toEqual('Sales')

    expect(location).toHaveProperty('sub_department')
    expect(location.sub_department).toEqual('Support')

    expect(location).toHaveProperty('street_name')
    expect(location.street_name).toEqual('Main Street')

    expect(location).toHaveProperty('building_number')
    expect(location.building_number).toEqual('123')

    expect(location).toHaveProperty('building_name')
    expect(location.building_name).toEqual('Big Building')

    expect(location).toHaveProperty('floor_number')
    expect(location.floor_number).toEqual('4')

    expect(location).toHaveProperty('room_number')
    expect(location.room_number).toEqual('101')

    expect(location).toHaveProperty('post_box')
    expect(location.post_box).toEqual('PO Box 123')

    expect(location).toHaveProperty('postal_code')
    expect(location.postal_code).toEqual('12345')

    expect(location).toHaveProperty('town_name')
    expect(location.town_name).toEqual('Townsville')

    expect(location).toHaveProperty('district_name')
    expect(location.district_name).toEqual('District 1')

    expect(location).toHaveProperty('country_subdivision')
    expect(location.country_subdivision).toEqual('State')

    expect(location).toHaveProperty('country')
    expect(location.country).toEqual('United States of America')

    expect(location).toHaveProperty('address_line')
    expect(location.address_line).toEqual('123 Main Street, Townsville')

    expect(location).toHaveProperty('latitude')
    expect(location.latitude).toEqual('40.7128')

    expect(location).toHaveProperty('longitude')
    expect(location.longitude).toEqual('74.0060')
  })
}
