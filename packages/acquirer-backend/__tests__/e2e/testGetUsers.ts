import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'

export function testGetUsers (app: Application): void {
  let dfspUserToken = ''
  let dfspUserWithId: PortalUserEntity
  const dfspUserEmail = DefaultDFSPUsers[0].email
  const dfspUserPwd = DefaultDFSPUsers[0].password
  const portalUserRepository = AppDataSource.getRepository(PortalUserEntity)

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
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    // Arrange

    // Act
    const res = await request(app).get('/api/v1/users')

    // Assert
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', 'Bearer invalid_token')

    // Assert
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 200 and Users array with only Same DFSP', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${dfspUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('List of users')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data.length).toBeGreaterThan(0)
    res.body.data.forEach((user: any) => {
      expect(user.dfsp.id).toEqual(dfspUserWithId.dfsp.id)
    })
  })
}
