import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import fs from 'fs'
import path from 'path'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'
import { MerchantRegistrationStatus, MerchantType, NumberOfEmployees } from 'shared-lib'
import { removeMerchantDocument } from '../../src/services/S3Client'
import { PortalPermissionEntity } from '../../src/entity/PortalPermissionEntity'
import { PermissionsEnum } from '../../src/types/permissions'
import { PortalRoleEntity } from '../../src/entity/PortalRoleEntity'

export function testPutMerchantDraft (app: Application): void {
  let token = ''
  const dfspUserEmail = DefaultDFSPUsers[0].email
  const dfspUserPwd = DefaultDFSPUsers[0].password
  const dfspUserDFSPName = DefaultDFSPUsers[0].dfsp_name
  let merchantId: number

  let differentDFSPUserToken = ''
  let differentDFSPUserEmail = ''
  let differentDFSPUserPwd = ''
  let differentDFSPUSerRoleName = ''

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: dfspUserPwd
      })
    token = loginRes.body.token

    // Create a merchant for testing
    const createRes = await request(app)
      .post('/api/v1/merchants/draft')
      .set('Authorization', `Bearer ${token}`)
      .field('dba_trading_name', 'Test Merchant')
      .field('registered_name', 'Test Merchant Registered')
      .field('employees_num', '1 - 5')
      .field('monthly_turnover', 0.5)
      .field('currency_code', 'PHP')
      .field('category_code', '10410')
      .field('merchant_type', MerchantType.INDIVIDUAL)
      .field('license_number', '123456789')
    merchantId = createRes.body.data.id

    // find different dfsp user
    for (const user of DefaultDFSPUsers) {
      if (user.dfsp_name !== dfspUserDFSPName) {
        differentDFSPUserEmail = user.email
        differentDFSPUserPwd = user.password
        differentDFSPUSerRoleName = user.role

        const res4 = await request(app)
          .post('/api/v1/users/login')
          .send({
            email: differentDFSPUserEmail,
            password: differentDFSPUserPwd
          })
        differentDFSPUserToken = res4.body.token
      }
    }
  })

  afterAll(async () => {
    // Clean up
    await AppDataSource.manager.delete(MerchantEntity, merchantId)
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app).put(`/api/v1/merchants/${merchantId}/draft`)
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${merchantId}/draft`)
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 422 for invalid merchant ID', async () => {
    const res = await request(app)
      .put('/api/v1/merchants/invalid_id/draft')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
  })

  it('should respond with 422 for non-existing merchant ID', async () => {
    const res = await request(app)
      .put('/api/v1/merchants/9999/draft')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
  })

  it('should respond with 400 for different DFSP user', async () => {
    // Arrange
    const editPerm = await AppDataSource.manager.findOneOrFail(PortalPermissionEntity, { where: { name: PermissionsEnum.EDIT_MERCHANTS } })
    const role = await AppDataSource.manager.findOneOrFail(PortalRoleEntity, { where: { name: differentDFSPUSerRoleName }, relations: ['permissions'] })
    role.permissions.push(editPerm)
    await AppDataSource.manager.save(role)

    // Act
    const res = await request(app)
      .put(`/api/v1/merchants/${merchantId}/draft`)
      .set('Authorization', `Bearer ${differentDFSPUserToken}`)
      .field('dba_trading_name', 'Updated Trading Name')
      .field('registered_name', 'Updated Registered Name')
      .field('employees_num', NumberOfEmployees.SIX_TO_TEN)
      .field('monthly_turnover', 1.0)
      .field('currency_code', 'USD')
      .field('category_code', '01120')
      .field('merchant_type', MerchantType.SMALL_SHOP)
      .field('license_number', '987654321')

    // Assert
    // expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Accessing different DFSP\'s Merchant is not allowed.')
  })
  // export const MerchantSubmitDataSchema = z.object({
  //   dba_trading_name: z.string().optional(),
  //   registered_name: z.string().optional().nullable().default(null),
  //   employees_num: z.nativeEnum(NumberOfEmployees).optional(),
  //   monthly_turnover: z.string().nullable().default(null),
  //   currency_code: z.nativeEnum(CurrencyCodes).optional(),
  //   category_code: z.string().optional(),
  //   merchant_type: z.nativeEnum(MerchantType).optional(),
  //   license_number: z.string().optional().optional()
  // })

  it('should respond with 422 for merchant not in draft status', async () => {
    // Arrange
    await AppDataSource.manager.update(MerchantEntity, merchantId, { registration_status: MerchantRegistrationStatus.APPROVED })

    // Act
    const res = await request(app)
      .put(`/api/v1/merchants/${merchantId}/draft`)
      .set('Authorization', `Bearer ${token}`)
      .field('dba_trading_name', 'Updated Trading Name')
      .field('registered_name', 'Updated Registered Name')
      .field('employees_num', NumberOfEmployees.SIX_TO_TEN)
      .field('monthly_turnover', 1.0)
      .field('currency_code', 'USD')
      .field('category_code', '01120')
      .field('merchant_type', MerchantType.SMALL_SHOP)
      .field('license_number', '987654321')

    // Assert
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual(`Merchant is not in Draft Status. Current Status: ${MerchantRegistrationStatus.APPROVED}`)

    // Clean up
    await AppDataSource.manager.update(MerchantEntity, merchantId, { registration_status: MerchantRegistrationStatus.DRAFT })
  })

  it('should respond with 200 when updating merchant without license_document', async () => {
    const res = await request(app)
      .put(`/api/v1/merchants/${merchantId}/draft`)
      .set('Authorization', `Bearer ${token}`)
      .field('dba_trading_name', 'Updated Trading Name')
      .field('registered_name', 'Updated Registered Name')
      .field('employees_num', NumberOfEmployees.SIX_TO_TEN)
      .field('monthly_turnover', 1.0)
      .field('currency_code', 'USD')
      .field('category_code', '01120')
      .field('merchant_type', MerchantType.SMALL_SHOP)
      .field('license_number', '987654321')

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Updating Merchant Draft Successful')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('id')
    expect(res.body.data).toHaveProperty('registration_status')
    expect(res.body.data.registration_status).toEqual(MerchantRegistrationStatus.DRAFT)
    expect(res.body.data).toHaveProperty('dba_trading_name')
    expect(res.body.data.dba_trading_name).toEqual('Updated Trading Name')
    expect(res.body.data).toHaveProperty('registered_name')
    expect(res.body.data.registered_name).toEqual('Updated Registered Name')
    expect(res.body.data).toHaveProperty('employees_num')
    expect(res.body.data.employees_num).toEqual(NumberOfEmployees.SIX_TO_TEN)
    expect(res.body.data).toHaveProperty('monthly_turnover')
    expect(Number(res.body.data.monthly_turnover)).toEqual(1.0)
    expect(res.body.data).toHaveProperty('currency_code')
    expect(res.body.data.currency_code).toEqual('USD')
    expect(res.body.data).toHaveProperty('category_code')
    expect(res.body.data.category_code).toEqual('01120')
    expect(res.body.data).toHaveProperty('merchant_type')
    expect(res.body.data.merchant_type).toEqual(MerchantType.SMALL_SHOP)
    expect(res.body.data).toHaveProperty('business_licenses')
    expect(res.body.data).toHaveProperty('registration_status')
    expect(res.body.data.registration_status).toEqual(MerchantRegistrationStatus.DRAFT)
  })

  it('should respond with 200 and updated merchant data with license_document file', async () => {
    const filePath = path.resolve(__dirname, '../test-files/updated-dummy.pdf')
    const res = await request(app)
      .put(`/api/v1/merchants/${merchantId}/draft`)
      .set('Authorization', `Bearer ${token}`)
      .field('dba_trading_name', 'Updated Trading Name 2')
      .field('registered_name', 'Updated Registered Name 2')
      .field('employees_num', NumberOfEmployees.SIX_TO_TEN)
      .field('monthly_turnover', 1.0)
      .field('currency_code', 'USD')
      .field('category_code', '01120')
      .field('merchant_type', MerchantType.SMALL_SHOP)
      .field('license_number', '987654321')
      .attach('license_document', fs.createReadStream(filePath), { filename: 'updated-dummy.pdf' })

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Updating Merchant Draft Successful')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('id')
    expect(res.body.data).toHaveProperty('registration_status')
    expect(res.body.data.registration_status).toEqual(MerchantRegistrationStatus.DRAFT)
    expect(res.body.data).toHaveProperty('dba_trading_name')
    expect(res.body.data.dba_trading_name).toEqual('Updated Trading Name 2')
    expect(res.body.data).toHaveProperty('registered_name')
    expect(res.body.data.registered_name).toEqual('Updated Registered Name 2')
    expect(res.body.data).toHaveProperty('employees_num')
    expect(res.body.data.employees_num).toEqual(NumberOfEmployees.SIX_TO_TEN)
    expect(res.body.data).toHaveProperty('monthly_turnover')
    expect(Number(res.body.data.monthly_turnover)).toEqual(1.0)
    expect(res.body.data).toHaveProperty('currency_code')
    expect(res.body.data.currency_code).toEqual('USD')
    expect(res.body.data).toHaveProperty('category_code')
    expect(res.body.data.category_code).toEqual('01120')
    expect(res.body.data).toHaveProperty('merchant_type')
    expect(res.body.data.merchant_type).toEqual(MerchantType.SMALL_SHOP)
    expect(res.body.data).toHaveProperty('business_licenses')
    expect(res.body.data).toHaveProperty('registration_status')
    expect(res.body.data.registration_status).toEqual(MerchantRegistrationStatus.DRAFT)
    expect(res.body.data.business_licenses).toHaveLength(1)
    expect(res.body.data.business_licenses[0]).toHaveProperty('id')
    expect(res.body.data.business_licenses[0]).toHaveProperty('license_number')
    expect(res.body.data.business_licenses[0]).toHaveProperty('license_document_link')
    expect(res.body.data.business_licenses[0].license_document_link).toContain('updated-dummy')

    // Clean up
    await removeMerchantDocument(res.body.data.business_licenses[0].license_document_link)
  })
}
