/* eslint-disable max-len */
import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers, DefaultHubUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { DFSPEntity } from '../../src/entity/DFSPEntity'

export function testGetDFSPs (app: Application): void {
  let hubUserToken = ''
  let dfspId = 0
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

    const res2 = await request(app)
      .post('/api/v1/dfsps')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: 'NewDFSP33',
        fspId: 'DFSP033',
        dfspType: 'Other',
        activated: true,
        logoURI: 'https://picsum.photos/200/300',
        businessLicenseId: "RGIHL23493RU"
      })
    dfspId = res2.body?.data?.id
  })

  afterAll(async () => {
    await AppDataSource.manager.delete(DFSPEntity, dfspId)
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/api/v1/dfsps')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .get('/api/v1/dfsps')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 200 and DFSP array data', async () => {
    const res = await request(app)
      .get('/api/v1/dfsps')
      .set('Authorization', `Bearer ${hubUserToken}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('OK')

    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it('should respond with 403 with `Forbidden` when users other than HUB User Type is not allowed to get a list of DFSP', async () => {
    // Arrange
    const dfspUserEmail = DefaultDFSPUsers[0].email
    const dfspUserPwd = DefaultDFSPUsers[0].password

    let res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: dfspUserPwd
      })
    const dfspToken: string = res.body.token

    // Act
    res = await request(app)
      .post('/api/v1/dfsps')
      .set('Authorization', `Bearer ${dfspToken}`)
      .send({
        name: 'NewDFSP',
        fspId: 'DFSP001',
        dfspType: 'Other',
        activated: true,
        logoURI: 'https://picsum.photos/200/300'
      })

    // Assert
    expect(res.statusCode).toEqual(403)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toContain('Forbidden')
  })
}
