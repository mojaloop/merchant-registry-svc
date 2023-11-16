/* eslint-disable max-len */
import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers, DefaultHubUsers } from '../../src/database/defaultUsers'

export function testGetUserProfile (app: Application): void {
  let hubUserToken = ''
  const hubUserEmail = DefaultHubUsers[0].email
  const hubUserPwd = DefaultHubUsers[0].password

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

    const dfspRes = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: dfspUserPwd
      })
    dfspUserToken = dfspRes.body.token
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/api/v1/users/profile')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond 200 with DFSP User data', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${dfspUserToken}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('GET Portal User Profile')

    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('id')
    expect(res.body.data).toHaveProperty('email')
    expect(res.body.data.email).toEqual(dfspUserEmail)
    expect(res.body.data).toHaveProperty('name')
    expect(res.body.data).not.toHaveProperty('password')
    expect(res.body.data).toHaveProperty('dfsp')
    expect(res.body.data.dfsp).toHaveProperty('id')
  })

  it('should respond 200 with Hub User data', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${hubUserToken}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('GET Portal User Profile')

    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('id')
    expect(res.body.data).toHaveProperty('email')
    expect(res.body.data.email).toEqual(hubUserEmail)
    expect(res.body.data).toHaveProperty('name')
    expect(res.body.data).not.toHaveProperty('password')
    expect(res.body.data).toHaveProperty('dfsp')
    expect(res.body.data.dfsp).toBeNull()
  })
}
