import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { MerchantEntity } from '../../src/entity/MerchantEntity'

export function testGetMerchantById (app: Application): void {
  let token = ''
  const validMerchantId = 1 // Replace with an actual merchant ID
  const invalidMerchantId = -1 // Replace with an invalid merchant ID
  const nonExistingMerchantId = 99999 // Replace with a non-existing merchant ID
  const dfspUserEmail = DefaultDFSPUsers[0].email
  const dfspUserPwd = DefaultDFSPUsers[0].password

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: dfspUserPwd
      })
    token = res.body.token
  })

  it('should respond with 401 status when Authorization header is missing', async () => {
    const res = await request(app).get(`/api/v1/merchants/${validMerchantId}`)
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 401 status when Authorization token is invalid', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/${validMerchantId}`)
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
  })

  it('should respond with 422 status when id is not a number', async () => {
    const res = await request(app)
      .get('/api/v1/merchants/invalid')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
  })

  it('should respond with 422 status when id is less than 1', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/${invalidMerchantId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(422)
  })

  it('should respond with 404 status when merchant does not exist', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/${nonExistingMerchantId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(404)
  })

  it('should respond with 400 status when user is not authorized to access the merchant', async () => {
    // You need to setup a merchant ID that the test user should not have access to.
    const unauthorizedMerchantId = 2
    const res = await request(app)
      .get(`/api/v1/merchants/${unauthorizedMerchantId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(400)
  })

  it('should respond with 500 status when server error occurs', async () => {
    // To simulate a server error, you may have to mock the service layer to throw an exception.
    const res = await request(app)
      .get(`/api/v1/merchants/${validMerchantId}`)
      .set('Authorization', `Bearer ${token}`)
    // Mock the service layer to throw an exception here
    expect(res.statusCode).toEqual(500)
  })

  it('should respond with 200 status and valid merchant data when everything is valid', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/${validMerchantId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('OK')
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Object)
  })
}
