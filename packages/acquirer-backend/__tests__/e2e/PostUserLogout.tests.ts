/* eslint-disable max-len */
import request from 'supertest'
import { type Application } from 'express'
import { DefaultHubUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { JwtTokenEntity } from '../../src/entity/JwtTokenEntity'

export function testPostUserLogout (app: Application): void {
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
    const res = await request(app).post('/api/v1/users/logout')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/users/logout')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond 200 with Logout Successful', async () => {
    // Arrange
    // Validate that the token exists
    await AppDataSource.manager.findOneOrFail(JwtTokenEntity, { where: { token: hubUserToken } })

    // Act
    const res = await request(app)
      .post('/api/v1/users/logout')
      .set('Authorization', `Bearer ${hubUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Logout Successful')

    const thisShouldNoLongerExists = await AppDataSource.manager.findOne(JwtTokenEntity, { where: { token: hubUserToken } })
    expect(thisShouldNoLongerExists).toBeNull()
  })
}
