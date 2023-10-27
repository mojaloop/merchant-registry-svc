import request from 'supertest'
import { type Application } from 'express'
import { DefaultHubUsers } from '../../src/database/defaultUsers'

export function testPostUserRefreshToken (app: Application): void {
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
    const res = await request(app).post('/api/v1/users/refresh')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/users/refresh')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should successfully Refrsh user Login Token ', async () => {
    // Act
    const res = await request(app)
      .post('/api/v1/users/refresh')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({ password: 'newValidPassword123!' })

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body.message).toEqual('Refresh Token')
    expect(res.body).toHaveProperty('token')
  })
}
