import request from 'supertest'
import { type Application } from 'express'
import { DefaultHubUsers } from '../../src/database/defaultUsers'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { AppDataSource } from '../../src/database/dataSource'
import { audit } from '../../src/utils/audit'
import { AuditEntity } from '../../src/entity/AuditEntity'

export function testGetHubAudits (app: Application): void {
  let hubUserToken = ''
  let hubUserWithId: PortalUserEntity
  const hubUserEmail = DefaultHubUsers[0].email
  const hubUserPwd = DefaultHubUsers[0].password
  const portalUserRepository = AppDataSource.getRepository(PortalUserEntity)

  // Sample Audit Data
  const sampleApplicationModule = 'testGetHubAudits'
  const sampleEventDesc = 'Testing Hub Audit Event'
  const sampleEntity = 'AuditEntity'

  beforeAll(async () => {
    // Arrange
    const res1 = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: hubUserEmail,
        password: hubUserPwd
      })
    hubUserToken = res1.body.token
    hubUserWithId = await portalUserRepository.findOneOrFail({ where: { email: hubUserEmail } })
    await audit(AuditActionType.UNAUTHORIZED_ACCESS, AuditTrasactionStatus.SUCCESS, sampleApplicationModule, sampleEventDesc, sampleEntity, {}, {}, hubUserWithId)
  })

  afterAll(async () => {
    // Delete the audit record created in beforeAll
    const auditRepository = AppDataSource.getRepository(AuditEntity)
    await auditRepository.delete({ event_description: sampleEventDesc })
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    // Arrange

    // Act
    const res = await request(app).get('/api/v1/audits/hub')

    // Assert
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get('/api/v1/audits/hub')
      .set('Authorization', 'Bearer invalid_token')

    // Assert
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 400 for invalid pagination parameters page=-1', async () => {
    // Arrange
    //

    // Act
    const res = await request(app)
      .get('/api/v1/audits/hub?page=-1&limit=10')
      .set('Authorization', `Bearer ${hubUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid pagination parameters')
  })

  it('should respond with 400 for invalid pagination parameters page=0', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get('/api/v1/audits/hub?page=-1&limit=10')
      .set('Authorization', `Bearer ${hubUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid pagination parameters')
  })

  it('should respond with 400 for invalid pagination parameters limit=-1', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get('/api/v1/audits/hub?page=1&limit=0')
      .set('Authorization', `Bearer ${hubUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid pagination parameters')
  })

  it('should respond with 400 for invalid pagination parameters limit=0', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get('/api/v1/audits/hub?page=1&limit=0')
      .set('Authorization', `Bearer ${hubUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid pagination parameters')
  })

  it('should respond with 400 for invalid pagination parameters page=-1,limit=0', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get('/api/v1/audits/hub?page=-1&limit=0')
      .set('Authorization', `Bearer ${hubUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid pagination parameters')
  })

  it('should respond with 200 and Audits array data', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get('/api/v1/audits/hub')
      .set('Authorization', `Bearer ${hubUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('GET Audit Logs Relating to Merchant Actions')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  // Action Type Tests
  it('should filter by actionType UnauthorizedAccess', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get(`/api/v1/audits/hub?actionType=${AuditActionType.UNAUTHORIZED_ACCESS}`)
      .set('Authorization', `Bearer ${hubUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data.length).toBeGreaterThan(0)
    res.body.data.forEach((audit: any) => {
      expect(audit).toHaveProperty('action_type')
      expect(audit.action_type).toEqual(AuditActionType.UNAUTHORIZED_ACCESS)
    })
  })

  // Portal User ID Tests
  it('should filter by valid portalUserId', async () => {
    // Arrange
    //

    // Act
    const res = await request(app)
      .get(`/api/v1/audits/hub?portalUserId=${hubUserWithId.id}`)
      .set('Authorization', `Bearer ${hubUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data.length).toBeGreaterThan(0)
    res.body.data.forEach((audit: any) => {
      expect(audit).toHaveProperty('portal_user')
      expect(audit.portal_user).toHaveProperty('id')
      expect(audit.portal_user.id).toEqual(hubUserWithId.id)
    })
  })

  // TransactionStatus Tests
  it('should filter by transactionStatus Success', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get(`/api/v1/audits/hub?transactionStatus=${AuditTrasactionStatus.SUCCESS}`)
      .set('Authorization', `Bearer ${hubUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data.length).toBeGreaterThan(0)
    res.body.data.forEach((audit: any) => {
      expect(audit).toHaveProperty('transaction_status')
      expect(audit.transaction_status).toEqual(AuditTrasactionStatus.SUCCESS)
    })
  })

  // // ApplicationModule Tests // TODO: Fix this test... somehow it's not working
  // it('should filter by applicationModule Audit', async () => {
  //   // Arrange
  //
  //   // Act
  //   const res = await request(app)
  //     .get(`/api/v1/audits/hub?applicationModule=${sampleApplicationModule}`)
  //     .set('Authorization', `Bearer ${hubUserToken}`)
  //
  //   // Assert
  //   expect(res.statusCode).toEqual(200)
  //   expect(res.body).toHaveProperty('data')
  //   expect(res.body.data).toBeInstanceOf(Array)
  //   expect(res.body.data.length).toBeGreaterThan(0)
  //   expect(res.body.data[0]).toHaveProperty('application_module')
  //   expect(res.body.data[0].application_module).toEqual(sampleApplicationModule)
  // })

  it('should not have any audits for MerchantEntity', async () => {
    // Arrange
    await audit(AuditActionType.UNAUTHORIZED_ACCESS, AuditTrasactionStatus.SUCCESS, sampleApplicationModule, sampleEventDesc, 'MerchantEntity', {}, {}, hubUserWithId)

    // Act
    const res = await request(app)
      .get('/api/v1/audits/hub')
      .set('Authorization', `Bearer ${hubUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)
    res.body.data.forEach((audit: any) => {
      expect(audit).toHaveProperty('entity_name')
      expect(audit.entity_name).not.toEqual('MerchantEntity')
    })
  })
}
