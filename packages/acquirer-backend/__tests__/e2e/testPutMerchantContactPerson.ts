import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { NumberOfEmployees } from 'shared-lib'
import { ContactPersonEntity } from '../../src/entity/ContactPersonEntity'

export function testPutMerchantContactPerson (app: Application): void {
  let token = ''
  let validMerchantId = 0
  let contactPersonId = 0
  const nonExistingMerchantId = 99999
  const nonExistingContactPersonId = 99999

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
    const contactPerson = AppDataSource.manager.create(ContactPersonEntity, {
      name: 'John',
      email: 'john@email.com',
      phone_number: '555-555-55555',
      merchant: merchant as MerchantEntity
    })
    await AppDataSource.manager.save(contactPerson)

    contactPersonId = contactPerson.id
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
    const res = await request(app).put(`/api/v1/merchants/${validMerchantId}/contact-persons/${contactPersonId}`)
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 status when Authorization token is invalid', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/contact-persons/${contactPersonId}`)
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 422 status when merchant id is not a number', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/invalid-merhchant-id/contact-persons/${contactPersonId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid Merchant ID')
  })

  it('should respond with 422 status when merchant id is less than 1', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/0/contact-persons/${contactPersonId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid Merchant ID')
  })

  it('should respond with 422 status when contact person id is not a number', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/contact-persons/invalid-contact-person-id`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid Contact Person ID')
  })

  it('should respond with 422 status when merchant id is less than 1', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/contact-persons/0`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid Contact Person ID')
  })

  it('should respond with 404 status when merchant does not exist', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${nonExistingMerchantId}/contact-persons/${contactPersonId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        identification_number: '123456789',
        name: 'John Doe Owner',
        email: 'john.doe.owner@example.com',
        phone_number: '3333-3333-3333'
      })
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Merchant not found')
  })

  it('should respond with 404 status when contact person does not exist', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/contact-persons/${nonExistingContactPersonId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        identification_number: '123456789',
        name: 'John Doe Owner',
        email: 'john.doe.owner@example.com',
        phone_number: '3333-3333-3333'
      })
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Contact Person not found')
  })

  it('should respond with 400 status when user is not authorized to access the merchant', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/contact-persons/${contactPersonId}`)
      .set('Authorization', `Bearer ${differentDFSPUserToken}`)
      .send({
        name: 'John Doe Owner',
        email: 'john.doe.owner@example.com',
        phone_number: '3333-3333-3333'
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Accessing different DFSP\'s Merchant is not allowed.')
  })

  it('should respond 422 status when contact person data fails schema validation', async () => {
    const invalidContactPersonData = {
      name: 'contact-person-name',
      phone_number: '9999999999',
      email: 'not-an-email', // Invalid email format
      is_same_as_business_owner: 'yes' // Should be a boolean, not a string
    }

    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/contact-persons/${contactPersonId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(invalidContactPersonData)

    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    const expectedErrors = [
      'Invalid email',
      'Expected boolean, received string'
    ]

    expectedErrors.forEach((error) => {
      expect(res.body.message).toContain(error)
    })
  })

  // if (req.body.is_same_as_business_owner === true) {
  //   const businessOwners = merchant.business_owners
  //   if (businessOwners == null || businessOwners.length === 0) {
  //     logger.error('Business Owner not found to be able to copy to Contact Person')
  //     return res.status(404).json({
  //       message: 'Business Owner not found to be able to copy to Contact Person'
  //     })
  //   }

  it('should respond 404 with Business Owner not found when is_same_as_business_owner=true but no owner is created', async () => {
    // Arrange (remove any business owners if exist)
    const merchant = await AppDataSource.manager.findOneOrFail(MerchantEntity, { where: { id: validMerchantId } })
    merchant.business_owners = []
    await AppDataSource.manager.save(merchant)

    // Act
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/contact-persons/${contactPersonId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        is_same_as_business_owner: true
      })
    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Business Owner not found to be able to copy to Contact Person')
  })

  // try {
  //   ContactPersonSubmitDataSchema.parse(contactPersonData)
  // } catch (err) {
  //   if (err instanceof z.ZodError) {
  //     logger.error('Contact Person Validation error: %o', err.issues.map(issue => issue.message))
  //     return res.status(422).send({ message: err.issues.map(issue => issue.message) })
  //   }
  // }
  // export const ContactPersonSubmitDataSchema = z.object({
  //   name: z.string(),
  //   phone_number: z.string(),
  //   email: z.string().email().or(z.literal(null)),
  //   is_same_as_business_owner: z.boolean().default(false)
  // })

  it('should respond 422 with Contact Person Validation error', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/contact-persons/${contactPersonId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        is_same_as_business_owner: 'yes',
        email: 'not-an-email-format'
      })

    expect(res.status).toBe(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual([
      'Required',
      'Required',
      'Invalid email',
      'Expected boolean, received string'
    ])
  })

  it('should respond 200 with Contact Person Updated message', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${validMerchantId}/contact-persons/${contactPersonId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'John Doe Contact 2',
        email: 'john.doe.contact2@example.com',
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
    expect(res.body.message).toEqual('Contact Person Updated')

    const updatedContactPerson = await AppDataSource.manager.getRepository(ContactPersonEntity)
      .findOneOrFail({
        where: { id: contactPersonId },
        relations: ['businessPersonLocation']
      })

    expect(updatedContactPerson).toHaveProperty('id')
    expect(updatedContactPerson).toHaveProperty('name')
    expect(updatedContactPerson.name).toEqual('John Doe Contact 2')

    expect(updatedContactPerson).toHaveProperty('email')
    expect(updatedContactPerson.email).toEqual('john.doe.contact2@example.com')

    expect(updatedContactPerson).toHaveProperty('phone_number')
    expect(updatedContactPerson.phone_number).toEqual('3333-3333-3333')

    // Clean up
    await AppDataSource.query('PRAGMA foreign_keys = OFF;')
    await AppDataSource.manager.getRepository(ContactPersonEntity).delete({ id: contactPersonId })
    await AppDataSource.query('PRAGMA foreign_keys = ON;')
  })
}
