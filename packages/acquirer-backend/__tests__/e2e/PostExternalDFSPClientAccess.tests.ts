/* eslint-disable max-len */
import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers, DefaultHubUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { DFSPEntity } from '../../src/entity/DFSPEntity'

export function testPostExternalDFSPClientAcess (app: Application): void {
  let hubUserToken = ''
  const hubUserEmail = DefaultHubUsers[0].email
  const hubUserPwd = DefaultHubUsers[0].password
  let dfspId = 0

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
        name: 'NewDFSP',
        fspId: 'DFSP001',
        dfspType: 'Other',
        activated: true,
        logoURI: 'https://picsum.photos/200/300',
        businessLicenseId: 'EUHDFHK438FJ'
      })
    dfspId = res2.body.data.id
  })

  afterAll(async () => {
    await AppDataSource.manager.delete(DFSPEntity, dfspId)
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app).post(`/api/v1/dfsps/${dfspId}/client-access-key`)
    expect(res.statusCode).toEqual(401)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .post(`/api/v1/dfsps/${dfspId}/client-access-key`)
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 400 when DFSP ID is not a number', async () => {
    const res = await request(app)
      .post('/api/v1/dfsps/abc/client-access-key')
      .set('Authorization', `Bearer ${hubUserToken}`)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('DFSP ID is not a number')
  })

  it('should respond with 404 when DFSP is not found', async () => {
    const res = await request(app)
      .post('/api/v1/dfsps/99998888/client-access-key')
      .set('Authorization', `Bearer ${hubUserToken}`)

    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('DFSP not found')
  })

  it('should respond with 400 when DFSP ID is not a number', async () => {
    const res = await request(app)
      .post('/api/v1/dfsps/abc/client-access-key')
      .set('Authorization', `Bearer ${hubUserToken}`)
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('DFSP ID is not a number')
  })

  it('should respond with 403 with `Forbidden` when users other than HUB User Type is not allowed to generate DFSP', async () => {
    // Arrange
    const dfspUserEmail = DefaultDFSPUsers[0].email
    const dfspUserPwd = DefaultDFSPUsers[0].password

    let res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: dfspUserPwd
      })
    const dfspUserToken: string = res.body.token

    // Act
    res = await request(app)
      .post(`/api/v1/dfsps/${dfspId}/client-access-key`)
      .set('Authorization', `Bearer ${dfspUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(403)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toContain('Forbidden') // "Forbidden. 'Create DFSPs' permission is required."
  })

  it('should respond with 201 with client-access-key data when everything is valid.', async () => {
    const res = await request(app)

      .post(`/api/v1/dfsps/${dfspId}/client-access-key`)
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: 'NewDFSP',
        fspId: 'DFSP001',
        dfspType: 'Other',
        activated: true,
        logoURI: 'https://picsum.photos/200/300',
        businessLicenseId: 'SHFSH874HGD'
      })

    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('DFSP Client Secret Key created successfully')
    expect(res.body).toHaveProperty('data')
    expect(typeof res.body.data).toEqual('string')
    expect(res.body.data.length).toBeGreaterThan(2)
  })
}
