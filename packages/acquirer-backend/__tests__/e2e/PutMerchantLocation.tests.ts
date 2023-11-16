import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { MerchantLocationType, NumberOfEmployees } from 'shared-lib'
import { MerchantLocationEntity } from '../../src/entity/MerchantLocationEntity'

export function testPutMerchantLocations (app: Application): void {
  let token = ''
  let validMerchantId = 0
  let validMerchantLocationId = 0
  const nonExistingMerchantId = 99999
  const nonExistingLocationId = 99999

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

    // Arrage Location data
    const res5 = await request(app)
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
    validMerchantLocationId = res5.body.data.id
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
    const res = await request(app).put(`/api/v1/merchants/${validMerchantId}/locations/${validMerchantLocationId}`)
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 status when Authorization token is invalid', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/locations/${validMerchantLocationId}`)
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 422 status when id is not a number', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/invalid/locations/${validMerchantLocationId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid Merchant ID')
  })

  it('should respond with 422 status when id is less than 1', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/0/locations/${validMerchantLocationId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid Merchant ID')
  })

  it('should respond with 404 status when merchant does not exist', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${nonExistingMerchantId}/locations/${validMerchantLocationId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Merchant not found')
  })

  it('should respond with 422 status when location id is not a number', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/locations/invalid`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid Location ID')
  })

  it('should respond with 404 status when location does not exist', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/locations/${nonExistingLocationId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Merchant Location not found')
  })

  it('should respond with 400 status when user is not authorized to access the merchant', async () => {
    // You need to setup a merchant ID that the test user should not have access to.
    const res = await request(app)
      .put(`/api/v1/merchants/${unauthorizedMerchantId}/locations/${validMerchantLocationId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Accessing different DFSP\'s Merchant is not allowed.')
  })

  it('should respond 422 with Merchant Location Updated message when everything is valid', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/locations/${validMerchantLocationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        location_type: 'non-existent-location-type'
      })

    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')

    expect(res.body.message).toEqual([
      "Invalid enum value. Expected 'Physical' | 'Virtual', received 'non-existent-location-type'"
    ])
  })

  it('should respond 200 with Merchant Location Updated message when everything is valid', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/locations/${validMerchantLocationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        location_type: MerchantLocationType.VIRTUAL,
        web_url: 'http://www.example99.com',
        address_type: 'Office99',
        department: 'Sales99',
        sub_department: 'Support99',
        street_name: 'Main Street 99',
        building_number: '99',
        building_name: 'Big Building 99',
        floor_number: '499',
        room_number: '10199',
        post_box: 'PO Box 99',
        postal_code: '99',
        town_name: 'Townsville 99',
        district_name: 'District 99',
        country_subdivision: 'State 99',
        country: 'United States of America 99',
        address_line: '99 Main Street, Townsville',
        latitude: '99.7128',
        longitude: '74.99'
      })

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Merchant Location Updated')

    const updatedLocation = await AppDataSource.manager.findOneOrFail(MerchantLocationEntity, {
      where: { id: validMerchantLocationId }
    })

    expect(updatedLocation).toHaveProperty('id')

    expect(updatedLocation).toHaveProperty('location_type')
    expect(updatedLocation.location_type).toEqual(MerchantLocationType.VIRTUAL)

    expect(updatedLocation).toHaveProperty('web_url')
    expect(updatedLocation.web_url).toEqual('http://www.example99.com')

    expect(updatedLocation).toHaveProperty('address_type')
    expect(updatedLocation.address_type).toEqual('Office99')

    expect(updatedLocation).toHaveProperty('department')
    expect(updatedLocation.department).toEqual('Sales99')

    expect(updatedLocation).toHaveProperty('sub_department')
    expect(updatedLocation.sub_department).toEqual('Support99')

    expect(updatedLocation).toHaveProperty('street_name')
    expect(updatedLocation.street_name).toEqual('Main Street 99')

    expect(updatedLocation).toHaveProperty('building_number')
    expect(updatedLocation.building_number).toEqual('99')

    expect(updatedLocation).toHaveProperty('building_name')
    expect(updatedLocation.building_name).toEqual('Big Building 99')

    expect(updatedLocation).toHaveProperty('floor_number')
    expect(updatedLocation.floor_number).toEqual('499')

    expect(updatedLocation).toHaveProperty('room_number')
    expect(updatedLocation.room_number).toEqual('10199')

    expect(updatedLocation).toHaveProperty('post_box')
    expect(updatedLocation.post_box).toEqual('PO Box 99')

    expect(updatedLocation).toHaveProperty('postal_code')
    expect(updatedLocation.postal_code).toEqual('99')

    expect(updatedLocation).toHaveProperty('town_name')
    expect(updatedLocation.town_name).toEqual('Townsville 99')

    expect(updatedLocation).toHaveProperty('district_name')
    expect(updatedLocation.district_name).toEqual('District 99')

    expect(updatedLocation).toHaveProperty('country_subdivision')
    expect(updatedLocation.country_subdivision).toEqual('State 99')

    expect(updatedLocation).toHaveProperty('country')
    expect(updatedLocation.country).toEqual('United States of America 99')

    expect(updatedLocation).toHaveProperty('address_line')
    expect(updatedLocation.address_line).toEqual('99 Main Street, Townsville')

    expect(updatedLocation).toHaveProperty('latitude')
    expect(updatedLocation.latitude).toEqual('99.7128')

    expect(updatedLocation).toHaveProperty('longitude')
    expect(updatedLocation.longitude).toEqual('74.99')

    // Clean up
    // await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0;')
    await AppDataSource.manager.getRepository(MerchantLocationEntity).delete({ id: validMerchantLocationId })
    // await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1;')
  })
}
