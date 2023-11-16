import request from 'supertest'
import { type Application } from 'express'
import jwt from 'jsonwebtoken'
import { readEnv } from '../../src/setup/readEnv'
import { AppDataSource } from '../../src/database/dataSource'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { PortalUserStatus, PortalUserType } from 'shared-lib'
import { EmailVerificationTokenEntity } from '../../src/entity/EmailVerificationToken'

export function testVerifyUser (app: Application): void {
  let unVerifyUser: any
  let unVerifyUserToken: string
  const JWT_SECRET = readEnv('JWT_SECRET', 'secret') as string

  beforeAll(async () => {
    // Generate Token using jwt
    unVerifyUser = AppDataSource.manager.create(PortalUserEntity)
    unVerifyUser.name = 'New Unverification User'
    unVerifyUser.email = 'new-unverification-user@email.com'
    unVerifyUser.user_type = PortalUserType.HUB
    unVerifyUser.status = PortalUserStatus.UNVERIFIED
    await AppDataSource.manager.save(unVerifyUser)

    unVerifyUserToken = jwt.sign(
      { id: unVerifyUser.id, email: unVerifyUser.email },
      JWT_SECRET, { expiresIn: '1y' })

    await AppDataSource.manager.save(EmailVerificationTokenEntity, {
      user: unVerifyUser,
      token: unVerifyUserToken,
      email: unVerifyUser.email
    })
  })

  it('should respond 200 status with OK message', async () => {
    // Arrange
    // Act
    const res = await request(app)
      .get(`/api/v1/users/verify?token=${unVerifyUserToken}`)

    // Assert
    expect(res.statusCode).toEqual(302) // Redirect to frontend to set password
  })

  it('should return 422 when token is not provided', async () => {
    const response = await request(app).get('/api/v1/users/verify')
    expect(response.status).toBe(422)
  })

  it('should return 401 when token is invalid', async () => {
    const response = await request(app).get('/api/v1/users/verify?token=invalidtoken')
    expect(response.status).toBe(401)
    expect(response.body.message).toEqual('JWT Invalid')
  })

  it('should return 404 when maliciously crafted token is used', async () => {
    // Arrange
    const verifiedUser = AppDataSource.manager.create(PortalUserEntity)
    verifiedUser.name = 'New Unverification User'
    verifiedUser.email = 'new-unverification-user@email.com'
    verifiedUser.user_type = PortalUserType.HUB
    verifiedUser.status = PortalUserStatus.RESETPASSWORD
    await AppDataSource.manager.save(verifiedUser)

    const maliciouslyCraftedToken = jwt.sign(
      { id: verifiedUser.id, email: verifiedUser.email },
      JWT_SECRET, { expiresIn: '1y' })

    const response = await request(app).get(`/api/v1/users/verify?token=${maliciouslyCraftedToken}`)
    expect(response.status).toBe(404)
    expect(response.body.message).toEqual('Token not found')
  })

  it('should return 400 when token is already used', async () => {
    // Arrange
    const verifiedUser = AppDataSource.manager.create(PortalUserEntity)
    verifiedUser.name = 'New Unverification User'
    verifiedUser.email = 'new-unverification-user@email.com'
    verifiedUser.user_type = PortalUserType.HUB
    verifiedUser.status = PortalUserStatus.RESETPASSWORD
    await AppDataSource.manager.save(verifiedUser)

    const usedToken = jwt.sign(
      { id: verifiedUser.id, email: verifiedUser.email },
      JWT_SECRET, { expiresIn: '1y' })

    await AppDataSource.manager.save(EmailVerificationTokenEntity, {
      user: verifiedUser,
      token: usedToken,
      email: verifiedUser.email,
      is_used: true
    })

    const response = await request(app).get(`/api/v1/users/verify?token=${usedToken}`)
    expect(response.status).toBe(400)
    expect(response.body.message).toEqual('Token already used')
  })

  it('should return 404 when user does not exist', async () => {
    const nonExistEmailToken = jwt.sign(
      { id: unVerifyUser.id, email: 'random-nonexistent-user@email.com' },
      JWT_SECRET, { expiresIn: '1y' })

    await AppDataSource.manager.save(EmailVerificationTokenEntity, {
      user: unVerifyUser,
      token: nonExistEmailToken,
      email: 'random-nonexistent-user@email.com',
      is_used: false
    })
    const response = await request(app).get(`/api/v1/users/verify?token=${nonExistEmailToken}`)
    expect(response.status).toBe(404)
    expect(response.body.message).toEqual('User not found')
  })
}
