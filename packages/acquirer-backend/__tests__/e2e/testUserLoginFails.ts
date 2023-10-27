/* eslint-disable max-len */

import request from 'supertest'
import { type Application } from 'express'
import { DefaultHubUsers, DefaultDFSPUsers } from '../../src/database/defaultUsers'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { AppDataSource } from '../../src/database/dataSource'
import { PortalUserStatus, PortalUserType } from 'shared-lib'

export function testUserLoginFails (app: Application): void {
  it('should respond with 422 status with Validation error message when empty email/password', async () => {
    // Arrange
    // Act
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: '',
        password: ''
      })

    // Assert
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Validation error')
  })

  it('should respond with 422 status with Validation error message when only empty email', async () => {
    // Arrange
    // Act
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: ''
      })

    // Assert
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Validation error')
  })

  it('should respond with 422 status with Validation error message when no data fields ', async () => {
    // Arrange
    // Act
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({})

    // Assert
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Validation error')
  })

  it('should respond with 400 status with Invalid credentials message when incorrect email/password', async () => {
    // Arrange

    // Act
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'email-that-dont-exist@email.com',
        password: 'incorrect-password-that-should-not-work'
      })

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid credentials')
  })

  it('should response 400 with "User is not verified"', async () => {
    // Arrange
    const newUser = new PortalUserEntity()
    newUser.name = 'unverified user'
    newUser.email = 'unverified-user-for-test@email.com'
    newUser.user_type = PortalUserType.HUB
    newUser.status = PortalUserStatus.UNVERIFIED
    // newUser.role = DefaultHubUsers[0].role
    await AppDataSource.manager.save(newUser)

    // Act
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: newUser.email,
        password: 'incorrect-password-that-should-not-work'
      })

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('User is not verified')

    // Clean up
    await AppDataSource.manager.delete(PortalUserEntity, newUser.id)
  })

  // if (user.status === PortalUserStatus.RESETPASSWORD) {
  //   throw new Error('User need to reset password')
  // }

  it('should response 400 with "User need to reset password"', async () => {
    // Arrange
    const newUser = new PortalUserEntity()
    newUser.name = 'resetting user'
    newUser.email = 'pwd-resetting-user-for-test@email.com'
    newUser.user_type = PortalUserType.HUB
    newUser.status = PortalUserStatus.RESETPASSWORD
    await AppDataSource.manager.save(newUser)

    // Act
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: newUser.email,
        password: 'incorrect-password-that-should-not-work'
      })

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('User need to reset password')

    // Clean up
    await AppDataSource.manager.delete(PortalUserEntity, newUser.id)
  })

  it('should respond with 422 status with Validation error message when correct hub user email but no password', async () => {
    // Arrange
    const hubUserEmail = DefaultHubUsers[0].email

    // Act
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: hubUserEmail
      })

    // Assert
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Validation error')
  })

  it('should respond with 422 status with Validation error message when correct dfsp user email but no password', async () => {
    // Arrange
    const dfspUserEmail = DefaultDFSPUsers[0].email

    // Act
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: ''
      })

    // Assert
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Validation error')
  })
  it('should respond with 400 status with Invalid credentials message when correct hub user email but incorrect password', async () => {
    // Arrange
    const hubUserEmail = DefaultHubUsers[0].email

    // Act
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: hubUserEmail,
        password: 'incorrect-password-that-should-not-work'
      })

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid credentials')
  })

  it('should respond with 400 status with Invalid credentials message when correct dfsp user email but incorrect password', async () => {
    // Arrange
    const dfspUserEmail = DefaultDFSPUsers[0].email

    // Act
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: dfspUserEmail,
        password: 'incorrect-password-that-should-not-work'
      })

    // Assert
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid credentials')
  })
}
