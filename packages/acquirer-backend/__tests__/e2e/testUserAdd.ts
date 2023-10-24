/* eslint-disable max-len */
import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers, DefaultHubUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { DFSPEntity } from '../../src/entity/DFSPEntity'

export function testUserAdd (app: Application): void {
  let token = ''
  const hubUserEmail = DefaultHubUsers[0].email
  const hubUserPwd = DefaultHubUsers[0].password

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: hubUserEmail,
        password: hubUserPwd
      })
    token = res.body.token
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app).post('/api/v1/dfsps')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/dfsps')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 201 and DFSP data when everything is valid.', async () => {
    const res = await request(app)
      .post('/api/v1/dfsps')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'NewDFSP',
        fspId: 'DFSP001',
        dfspType: 'Other',
        joinedDate: '2021-01-01',
        activated: true,
        logoURI: 'https://picsum.photos/200/300'
      })

    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('DFSP created successfully')
    // Clean up
    await AppDataSource.manager.delete(DFSPEntity, res.body.data.id)
  })

  // return res.status(403).send({ message: `Forbidden. ${user.user_type} User is not allowed.` })
  it('should respond with 403 with `Forbidden` when users other than HUB User Type is not allowed to create DFSP', async () => {
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
        joinedDate: '2021-01-01',
        activated: true,
        logoURI: 'https://picsum.photos/200/300'
      })

    // Assert
    expect(res.statusCode).toEqual(403)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toContain('Forbidden') // "Forbidden. 'Create DFSPs' permission is required."
  })
}
