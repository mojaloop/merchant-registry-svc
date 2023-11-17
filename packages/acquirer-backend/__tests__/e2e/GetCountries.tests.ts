import request from 'supertest'
import { type Application } from 'express'
import { DefaultDFSPUsers } from '../../src/database/defaultUsers'
import path from 'path'
import { seedCountriesSubdivisionsDistricts } from '../../src/database/initDatabase'
import { AppDataSource } from '../../src/database/dataSource'

export function testGetCountries (app: Application): void {
  let dfspUserToken = ''
  const dfspUserEmail = DefaultDFSPUsers[0].email
  const dfspUserPwd = DefaultDFSPUsers[0].password

  beforeAll(async () => {
    const res1 = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: dfspUserPwd
      })
    dfspUserToken = res1.body.token
    const countryDataPath = path.join(__dirname, '../test-files/sample.countries.json')

    // Act
    await seedCountriesSubdivisionsDistricts(AppDataSource, countryDataPath)
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/api/v1/countries')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .get('/api/v1/countries')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 200 and Countries List array data', async () => {
    const res = await request(app)
      .get('/api/v1/countries')
      .set('Authorization', `Bearer ${dfspUserToken}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('OK')

    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data.length).toBeGreaterThan(0)
  })
}
