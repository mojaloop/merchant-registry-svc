import request from 'supertest'
import { type Application } from 'express'
import { DefaultHubUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { PortalUserStatus } from 'shared-lib'

export function testPutUserResetPassword (app: Application): void {
  let hubUserToken = ''
  const hubUserEmail = DefaultHubUsers[0].email
  const hubUserPwd = DefaultHubUsers[0].password

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: hubUserEmail,
        password: hubUserPwd
      })
    hubUserToken = res.body.token
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app).put('/api/v1/users/reset-password')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .put('/api/v1/users/reset-password')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should successfully reset user password with Active status', async () => {
    // Act
    let res = await request(app)
      .put('/api/v1/users/reset-password')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({ password: 'newValidPassword123!' })

    // Assert
    expect(res.statusCode).toEqual(201)
    expect(res.body.message).toEqual('Reset Password Successful')
    const res2 = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: hubUserEmail,
        password: 'newValidPassword123!'
      })
    expect(res2.statusCode).toEqual(200)
    expect(res2.body).toHaveProperty('token')

    // Reset password back to original
    res = await request(app)
      .put('/api/v1/users/reset-password')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({ password: 'password' })
  })

  it('should successfully reset user password with RESETPASSWORD status', async () => {
    // Arrange
    await AppDataSource.manager.update(PortalUserEntity, { email: hubUserEmail }, { status: PortalUserStatus.RESETPASSWORD })

    // Act
    let res = await request(app)
      .put('/api/v1/users/reset-password')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({ password: 'newValidPassword123!' })

    // Assert
    expect(res.statusCode).toEqual(201)
    expect(res.body.message).toEqual('Reset Password Successful')
    const res2 = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: hubUserEmail,
        password: 'newValidPassword123!'
      })
    expect(res2.statusCode).toEqual(200)
    expect(res2.body).toHaveProperty('token')
    // ResetPassword should be changed to Active
    const exists = await AppDataSource.manager.findOne(PortalUserEntity, { where: { email: hubUserEmail, status: PortalUserStatus.ACTIVE } })
    expect(exists).toBeTruthy()

    // Reset password back to original
    res = await request(app)
      .put('/api/v1/users/reset-password')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({ password: 'password' })
  })
}
