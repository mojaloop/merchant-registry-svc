import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { AppDataSource } from '../../src/database/dataSource'
import { audit } from '../../src/utils/audit'
import { AuditEntity } from '../../src/entity/AuditEntity'

export function testGetAudits (app: Application): void {
  let dfspUserToken = ''
  let dfspUserWithId: PortalUserEntity
  const dfspUserEmail = DefaultDFSPUsers[0].email
  const dfspUserPwd = DefaultDFSPUsers[0].password
  const portalUserRepository = AppDataSource.getRepository(PortalUserEntity)

  // Sample Audit Data
  const sampleApplicationModule = 'testGetAudits'
  const sampleEventDesc = 'Testing Audit Event'
  const sampleEntity = 'AuditEntity'

  beforeAll(async () => {
    // Arrange
    const res1 = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: dfspUserPwd
      })
    dfspUserToken = res1.body.token
    dfspUserWithId = await portalUserRepository.findOneOrFail({ where: { email: dfspUserEmail }, relations: ['dfsp'] })
    await audit(AuditActionType.UNAUTHORIZED_ACCESS, AuditTrasactionStatus.SUCCESS, sampleApplicationModule, sampleEventDesc, sampleEntity, {}, {}, dfspUserWithId)
  })

  afterAll(async () => {
    // Delete the audit record created in beforeAll
    const auditRepository = AppDataSource.getRepository(AuditEntity)
    await auditRepository.delete({ event_description: sampleEventDesc })
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    // Arrange

    // Act
    const res = await request(app).get('/api/v1/audits')

    // Assert
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get('/api/v1/audits')
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
      .get('/api/v1/audits?page=-1&limit=10')
      .set('Authorization', `Bearer ${dfspUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid pagination parameters')
  })

  it('should respond with 400 for invalid pagination parameters page=0', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get('/api/v1/audits?page=-1&limit=10')
      .set('Authorization', `Bearer ${dfspUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid pagination parameters')
  })

  it('should respond with 400 for invalid pagination parameters limit=-1', async () => {
    // Arrange
    //

    // Act
    const res = await request(app)
      .get('/api/v1/audits?page=1&limit=0')
      .set('Authorization', `Bearer ${dfspUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid pagination parameters')
  })

  it('should respond with 400 for invalid pagination parameters limit=0', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get('/api/v1/audits?page=1&limit=0')
      .set('Authorization', `Bearer ${dfspUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid pagination parameters')
  })

  it('should respond with 400 for invalid pagination parameters page=-1,limit=0', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get('/api/v1/audits?page=-1&limit=0')
      .set('Authorization', `Bearer ${dfspUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid pagination parameters')
  })

  it('should respond with 200 and Audits array data', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get('/api/v1/audits')
      .set('Authorization', `Bearer ${dfspUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('OK')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  // Action Type Tests
  it('should filter by actionType UnauthorizedAccess', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get(`/api/v1/audits?actionType=${AuditActionType.UNAUTHORIZED_ACCESS}`)
      .set('Authorization', `Bearer ${dfspUserToken}`)

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
      .get(`/api/v1/audits?portalUserId=${dfspUserWithId.id}`)
      .set('Authorization', `Bearer ${dfspUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data.length).toBeGreaterThan(0)
    res.body.data.forEach((audit: any) => {
      expect(audit).toHaveProperty('portal_user')
      expect(audit.portal_user).toHaveProperty('id')
      expect(audit.portal_user.id).toEqual(dfspUserWithId.id)
    })
  })

  // TransactionStatus Tests
  it('should filter by transactionStatus Success', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get(`/api/v1/audits?transactionStatus=${AuditTrasactionStatus.SUCCESS}`)
      .set('Authorization', `Bearer ${dfspUserToken}`)

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

  // ApplicationModule Tests
  it('should filter by applicationModule Audit', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get(`/api/v1/audits?applicationModule=${sampleApplicationModule}`)
      .set('Authorization', `Bearer ${dfspUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data[0]).toHaveProperty('application_module')
    expect(res.body.data[0].application_module).toEqual(sampleApplicationModule)
  })

  // EntityName Tests
  it('should filter by entityName AuditEntity', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get(`/api/v1/audits?entityName=${sampleEntity}`)
      .set('Authorization', `Bearer ${dfspUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data[0]).toHaveProperty('entity_name')
    expect(res.body.data[0].entity_name).toEqual(sampleEntity)
  })
}
