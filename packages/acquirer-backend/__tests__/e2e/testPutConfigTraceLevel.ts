import { type Application } from 'express'
import { DefaultHubUsers } from '../../src/database/defaultUsers'
import request from 'supertest'
import { AppDataSource } from '../../src/database/dataSource'
import { PortalRoleEntity } from '../../src/entity/PortalRoleEntity'
import { PortalPermissionEntity } from '../../src/entity/PortalPermissionEntity'
import { PermissionsEnum } from '../../src/types/permissions'

export function testPutConfigTraceLevel (app: Application): void {
  let token = ''
  const hubUserEmail = DefaultHubUsers[0].email
  const hubUserPwd = DefaultHubUsers[0].password
  const hubUserRole = DefaultHubUsers[0].role

  const portalRoleRepository = AppDataSource.getRepository(PortalRoleEntity)
  const permissionRepository = AppDataSource.getRepository(PortalPermissionEntity)

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
    const res = await request(app).put('/api/v1/config/trace-level')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .put('/api/v1/config/trace-level')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 403 when user does not have EDIT_SERVER_LOG_LEVEL permission', async () => {
    // Arrange
    const role = await portalRoleRepository.findOneOrFail({ where: { name: hubUserRole }, relations: ['permissions'] })
    const originalRolePermissions = [...role.permissions]
    role.permissions = role.permissions.filter(permission => permission.name !== PermissionsEnum.EDIT_SERVER_LOG_LEVEL)
    await portalRoleRepository.save(role)

    const res = await request(app)
      .put('/api/v1/config/trace-level')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(403)
    expect(res.body.message).toEqual('Forbidden. \'Edit Server Log Level\' permission is required.')

    // Restore
    role.permissions = originalRolePermissions
    await portalRoleRepository.save(role)
  })

  it('should respond with 400 when level is invalid', async () => {
    // Arrange
    const role = await portalRoleRepository.findOneOrFail({ where: { name: hubUserRole }, relations: ['permissions'] })
    const editLogPermission = await permissionRepository.findOneOrFail({ where: { name: PermissionsEnum.EDIT_SERVER_LOG_LEVEL } })

    const originalRolePermissions = [...role.permissions]
    role.permissions.push(editLogPermission)
    await portalRoleRepository.save(role)

    // Act
    const res = await request(app)
      .put('/api/v1/config/trace-level')
      .set('Authorization', `Bearer ${token}`)
      .send({ level: 'invalid' })
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid log level: invalid')

    // Restore
    role.permissions = originalRolePermissions
    await portalRoleRepository.save(role)
  })

  it('should respond with 200 when level is valid', async () => {
    // Arrange
    const role = await portalRoleRepository.findOneOrFail({ where: { name: hubUserRole }, relations: ['permissions'] })
    const editLogPermission = await permissionRepository.findOneOrFail({ where: { name: PermissionsEnum.EDIT_SERVER_LOG_LEVEL } })

    const originalRolePermissions = [...role.permissions]
    role.permissions.push(editLogPermission)
    await portalRoleRepository.save(role)

    // Act
    const res = await request(app)
      .put('/api/v1/config/trace-level')
      .set('Authorization', `Bearer ${token}`)
      .send({ level: 'debug' })
    expect(res.statusCode).toEqual(200)
    expect(res.body.message).toEqual('Log level set successfully')

    // Restore
    role.permissions = originalRolePermissions
    await portalRoleRepository.save(role)
  })
}
