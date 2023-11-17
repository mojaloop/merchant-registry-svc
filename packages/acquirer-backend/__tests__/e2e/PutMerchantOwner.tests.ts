import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { BusinessOwnerIDType, NumberOfEmployees } from 'shared-lib'
import { BusinessOwnerEntity } from '../../src/entity/BusinessOwnerEntity'

export function testPutMerchantOwner (app: Application): void {
  let token = ''
  let validMerchantId = 0
  let ownerId = 0
  const nonExistingMerchantId = 99999
  const nonExistingOwnerId = 99999

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

    const merchant = await AppDataSource.manager.findOne(MerchantEntity, { where: { id: validMerchantId } })
    const owner = AppDataSource.manager.create(BusinessOwnerEntity, {
      identification_number: '12345',
      identificaton_type: BusinessOwnerIDType.NATIONAL_ID,
      name: 'Owner John',
      email: 'owner-john@email.com',
      phone_number: '555-555-55555',
      merchants: [merchant as MerchantEntity]
    })
    await AppDataSource.manager.save(owner)

    ownerId = owner.id
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
    const res = await request(app).put(`/api/v1/merchants/${validMerchantId}/business-owners/${ownerId}`)
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 status when Authorization token is invalid', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/business-owners/${ownerId}`)
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 422 status when merchant id is not a number', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/invalid-merhchant-id/business-owners/${ownerId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid Merchant ID')
  })

  it('should respond with 422 status when owner id is not a number', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/business-owners/invalid-owner-id`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid Owner ID')
  })

  it('should respond with 422 status when merchant id is less than 1', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/0/business-owners/${ownerId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid Merchant ID')
  })

  it('should respond with 422 status when merchant id is less than 1', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/business-owners/0`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid Owner ID')
  })

  it('should respond with 404 status when merchant does not exist', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${nonExistingMerchantId}/business-owners/${ownerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        identificaton_type: BusinessOwnerIDType.NATIONAL_ID,
        identification_number: '123456789',
        name: 'John Doe Owner',
        email: 'john.doe.owner@example.com',
        phone_number: '3333-3333-3333'
      })
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Merchant not found')
  })

  it('should respond with 404 status when owner does not exist', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/business-owners/${nonExistingOwnerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        identificaton_type: BusinessOwnerIDType.NATIONAL_ID,
        identification_number: '123456789',
        name: 'John Doe Owner',
        email: 'john.doe.owner@example.com',
        phone_number: '3333-3333-3333'
      })
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Business Owner with provided Merchant not found')
  })

  it('should respond with 400 status when user is not authorized to access the merchant', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/business-owners/${ownerId}`)
      .set('Authorization', `Bearer ${differentDFSPUserToken}`)
      .send({
        identificaton_type: BusinessOwnerIDType.NATIONAL_ID,
        identification_number: '123456789',
        name: 'John Doe Owner',
        email: 'john.doe.owner@example.com',
        phone_number: '3333-3333-3333'
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Accessing different DFSP\'s Merchant is not allowed.')
  })

  it('should respond 200 with Business Owner Updated message', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/business-owners/${ownerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        identificaton_type: BusinessOwnerIDType.NATIONAL_ID,
        identification_number: '123456789',
        name: 'John Doe Owner',
        email: 'john.doe.owner@example.com',
        phone_number: '3333-3333-3333',

        // location data
        address_type: 'Office 33',
        department: 'Sales33',
        sub_department: 'Support 33',
        street_name: 'Main Street 33',
        building_number: '123 33',
        building_name: 'Big Building 33',
        floor_number: '433',
        room_number: '10133',
        post_box: 'PO Box  33',
        postal_code: '333',
        town_name: 'Townsville 33',
        district_name: 'District 33',
        country_subdivision: 'State 33',
        country: 'United States of America',
        address_line: '123 Main Street, Townsville 33',
        latitude: '33.7128',
        longitude: '33.0060'
      })

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Business Owner Updated')

    const updatedOwner = await AppDataSource.manager.getRepository(BusinessOwnerEntity)
      .findOneOrFail({
        where: { id: ownerId },
        relations: ['businessPersonLocation']
      })

    expect(updatedOwner).toHaveProperty('id')
    expect(updatedOwner).toHaveProperty('name')
    expect(updatedOwner.name).toEqual('John Doe Owner')

    expect(updatedOwner).toHaveProperty('email')
    expect(updatedOwner.email).toEqual('john.doe.owner@example.com')

    expect(updatedOwner).toHaveProperty('phone_number')
    expect(updatedOwner.phone_number).toEqual('3333-3333-3333')

    expect(updatedOwner).toHaveProperty('identificaton_type')
    expect(updatedOwner.identificaton_type).toEqual(BusinessOwnerIDType.NATIONAL_ID)

    expect(updatedOwner).toHaveProperty('identification_number')
    expect(updatedOwner.identification_number).toEqual('123456789')

    // expect(updatedOwner).toHaveProperty('businessPersonLocation')
    // expect(updatedOwner.businessPersonLocation).toBeInstanceOf(Object)
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('address_type')
    // expect(updatedOwner.businessPersonLocation.address_type).toEqual('Office 33')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('department')
    // expect(updatedOwner.businessPersonLocation.department).toEqual('Sales33')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('sub_department')
    // expect(updatedOwner.businessPersonLocation.sub_department).toEqual('Support 33')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('street_name')
    // expect(updatedOwner.businessPersonLocation.street_name).toEqual('Main Street 33')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('building_number')
    // expect(updatedOwner.businessPersonLocation.building_number).toEqual('123 33')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('building_name')
    // expect(updatedOwner.businessPersonLocation.building_name).toEqual('Big Building 33')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('floor_number')
    // expect(updatedOwner.businessPersonLocation.floor_number).toEqual('433')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('room_number')
    // expect(updatedOwner.businessPersonLocation.room_number).toEqual('10133')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('post_box')
    // expect(updatedOwner.businessPersonLocation.post_box).toEqual('PO Box  33')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('postal_code')
    // expect(updatedOwner.businessPersonLocation.postal_code).toEqual('333')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('town_name')
    // expect(updatedOwner.businessPersonLocation.town_name).toEqual('Townsville 33')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('district_name')
    // expect(updatedOwner.businessPersonLocation.district_name).toEqual('District 33')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('country_subdivision')
    // expect(updatedOwner.businessPersonLocation.country_subdivision).toEqual('State 33')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('country')
    // expect(updatedOwner.businessPersonLocation.country).toEqual('United States of America')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('address_line')
    // expect(updatedOwner.businessPersonLocation.address_line).toEqual('123 Main Street, Townsville 33')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('latitude')
    // expect(updatedOwner.businessPersonLocation.latitude).toEqual('33.7128')
    //
    // expect(updatedOwner.businessPersonLocation).toHaveProperty('longitude')
    // expect(updatedOwner.businessPersonLocation.longitude).toEqual('33.0060')

    // Clean up
    await AppDataSource.query('PRAGMA foreign_keys = OFF;')
    await AppDataSource.manager.getRepository(BusinessOwnerEntity).delete({ id: ownerId })
    await AppDataSource.query('PRAGMA foreign_keys = ON;')
  })
}
