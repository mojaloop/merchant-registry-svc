/* eslint-disable max-len */

import request from 'supertest'
import { type Application } from 'express'
import { DefaultHubUsers, DefaultDFSPUsers } from '../../src/database/defaultUsers'

export function testUserLoginSucceed (app: Application): void {
  it('should respond with 200 status with Login successful message and token when correct hub user email and password', async () => {
    // Arrange
    const hubUserEmail = DefaultHubUsers[0].email
    const hubUserPassword = DefaultHubUsers[0].password

    // Act
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: hubUserEmail,
        password: hubUserPassword
      })

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Login successful')
    expect(res.body).toHaveProperty('token')
    expect(res.body.token).toEqual(expect.any(String))
    expect(res.body.token).not.toEqual('')
  })

  it('should respond with 200 status with Login successful message and token when correct dfsp user email and password', async () => {
    // Arrange
    const dfspUserEmail = DefaultDFSPUsers[0].email
    const dfspUserPassword = DefaultDFSPUsers[0].password

    // Act
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: dfspUserPassword
      })

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Login successful')
    expect(res.body).toHaveProperty('token')
    expect(res.body.token).toEqual(expect.any(String))
    expect(res.body.token).not.toEqual('')
  })

  it('should respond with 200 status with Login successful message and token when for all hub users', async () => {
    for (const hubUser of DefaultHubUsers) {
      // Arrange
      const hubUserEmail = hubUser.email
      const hubUserPassword = hubUser.password

      // Act
      const res = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: hubUserEmail,
          password: hubUserPassword
        })

      // Assert
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('Login successful')
      expect(res.body).toHaveProperty('token')
      expect(res.body.token).toEqual(expect.any(String))
      expect(res.body.token).not.toEqual('')
    }
  })

  it(`should respond with 200 status with Login successful message and token when for all ${DefaultDFSPUsers.length} dfsp users`, async () => {
    for (const dfspUser of DefaultDFSPUsers) {
      // Arrange
      const dfspUserEmail = dfspUser.email
      const dfspUserPassword = dfspUser.password

      // Act
      const res = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: dfspUserEmail,
          password: dfspUserPassword
        })

      // Assert
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('Login successful')
      expect(res.body).toHaveProperty('token')
      expect(res.body.token).toEqual(expect.any(String))
      expect(res.body.token).not.toEqual('')
    }
  })
}
