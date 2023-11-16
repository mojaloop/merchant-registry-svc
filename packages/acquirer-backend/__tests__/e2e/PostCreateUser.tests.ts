/* eslint-disable max-len */
import * as emailUtils from '../../src/utils/sendGrid'
import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers, DefaultHubUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { DFSPEntity } from '../../src/entity/DFSPEntity'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { DefaultRoles } from '../../src/database/defaultRoles'
import { PortalUserStatus } from 'shared-lib'
const sgMail = require('@sendgrid/mail')

jest.mock('../../src/utils/sendGrid')
const mockedSendVerificationEmail = emailUtils.sendVerificationEmail as jest.MockedFunction<typeof emailUtils.sendVerificationEmail>

export function testPostCreateUser (app: Application): void {
  let hubUserToken = ''
  const hubUserEmail = DefaultHubUsers[0].email
  const hubUserPwd = DefaultHubUsers[0].password
  let validDfspId = 0

  let dfspUserToken = ''
  const dfspUserEmail = DefaultDFSPUsers[0].email
  const dfspUserPwd = DefaultDFSPUsers[0].password
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: hubUserEmail,
        password: hubUserPwd
      })
    hubUserToken = res.body.token

    const res2 = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: dfspUserPwd
      })
    dfspUserToken = res2.body.token

    const dfsp = await AppDataSource.manager.findOne(DFSPEntity, { where: { name: DefaultDFSPUsers[0].dfsp_name } })
    validDfspId = dfsp?.id as number
  })

  beforeEach(() => {
    mockedSendVerificationEmail.mockResolvedValue(undefined)
    sgMail.send.mockResolvedValue([
      {
        statusCode: 200,
        body: '',
        headers: {}
      }
    ])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app).post('/api/v1/users/add')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/users/add')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 422 when name is missing', async () => {
    const roleName = DefaultRoles[1].name // Use an appropriate role name
    const res = await request(app)
      .post('/api/v1/users/add')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        // name is omitted
        email: 'test@example.com',
        role: roleName,
        dfsp_id: validDfspId
      })

    expect(res.statusCode).toEqual(422)
    expect(res.body.message).toContain('Validation error')
    expect(res.body.errors).toHaveProperty('fieldErrors')
    expect(res.body.errors.fieldErrors).toHaveProperty('name')
  })

  it('should respond with 422 when email is invalid', async () => {
    const roleName = DefaultRoles[1].name
    const res = await request(app)
      .post('/api/v1/users/add')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: 'Test User',
        email: 'not-an-email', // Invalid email format
        role: roleName,
        dfsp_id: validDfspId
      })

    expect(res.statusCode).toEqual(422)
    expect(res.body.message).toContain('Validation error')
    expect(res.body.errors).toHaveProperty('fieldErrors')
    expect(res.body.errors.fieldErrors).toHaveProperty('email')
  })

  it('should respond with 422 when role is missing', async () => {
    const res = await request(app)
      .post('/api/v1/users/add')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: 'Test User',
        email: 'test@example.com',
        // role is omitted
        dfsp_id: validDfspId
      })

    expect(res.statusCode).toEqual(422)
    expect(res.body.message).toContain('Validation error')
    expect(res.body.errors).toHaveProperty('fieldErrors')
    expect(res.body.errors.fieldErrors).toHaveProperty('role')
  })

  it('should respond with 400 when role is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/users/add')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: 'Test User',
        email: 'super-user-222@example.com',
        role: 'invalid-role', // Invalid role
        dfsp_id: validDfspId
      })

    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid role')
  })

  it('should respond with 400 when email already exists', async () => {
    const roleName = DefaultRoles[1].name // DFSP Super Admin
    const res = await request(app)
      .post('/api/v1/users/add')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: 'Test User',
        email: DefaultHubUsers[0].email,
        role: roleName,
        dfsp_id: validDfspId
      })

    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Email already exists')
  })

  it('should fails when creating a user from hub admin with invalid dfspid', async () => {
    const roleName = DefaultRoles[1].name // DFSP Super Admin
    const res = await request(app)
      .post('/api/v1/users/add')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: 'Test User 33',
        email: 'super-new-user-33@example.com',
        role: roleName,
        dfsp_id: 9999999 // if it's a HUB user
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid dfsp_id: DFSP Not found')
  })

  it('should successfully create a user from hub admin and send verification email', async () => {
    // Arrange
    await AppDataSource.manager.delete(PortalUserEntity, { email: 'super-new-user@example.com' })
    const roleName = DefaultRoles[1].name // DFSP Super Admin

    // Act
    const res = await request(app)
      .post('/api/v1/users/add')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: 'Test User',
        email: 'super-new-user@example.com',
        role: roleName,
        dfsp_id: validDfspId // if it's a HUB user
      })

    // Assert
    expect(res.statusCode).toEqual(201)
    expect(res.body.message).toEqual('User created. And Verification Email Sent')
    expect(res.body.data).toHaveProperty('id')

    expect(res.body.data).toHaveProperty('name')
    expect(res.body.data.name).toEqual('Test User')

    expect(res.body.data).toHaveProperty('email')
    expect(res.body.data.email).toEqual('super-new-user@example.com')
    expect(res.body.data.status).toEqual(PortalUserStatus.UNVERIFIED)

    // Clean up
    await AppDataSource.manager.delete(PortalUserEntity, { id: res.body.data.id })
  })

  it('should successfully create a user from super dfsp admin and send verification email', async () => {
    // Arrange
    await AppDataSource.manager.delete(PortalUserEntity, { email: 'new-audit-test-user@example.com' })
    const roleName = DefaultRoles[DefaultRoles.length - 1].name // DFSP Audit User

    // Act
    const res = await request(app)
      .post('/api/v1/users/add')
      .set('Authorization', `Bearer ${dfspUserToken}`)
      .send({
        name: 'Test User 2',
        email: 'new-audit-test-user@example.com',
        role: roleName
      })

    // Assert
    expect(res.statusCode).toEqual(201)
    expect(res.body.message).toEqual('User created. And Verification Email Sent')
    expect(res.body.data).toHaveProperty('id')

    expect(res.body.data).toHaveProperty('name')
    expect(res.body.data.name).toEqual('Test User 2')

    expect(res.body.data).toHaveProperty('email')
    expect(res.body.data.email).toEqual('new-audit-test-user@example.com')

    expect(res.body.data.status).toEqual(PortalUserStatus.UNVERIFIED)

    // Clean up
    await AppDataSource.manager.delete(PortalUserEntity, { email: 'new-audit-test-user@example.com' })
  })
}
