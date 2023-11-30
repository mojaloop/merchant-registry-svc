/* eslint-disable max-len */
import request from 'supertest'
import { type Application } from 'express'
import { DefaultHubUsers } from '../../src/database/defaultUsers'
import { AppDataSource } from '../../src/database/dataSource'
import { PortalRoleEntity } from '../../src/entity/PortalRoleEntity'
import { PortalPermissionEntity } from '../../src/entity/PortalPermissionEntity'
import { PermissionsEnum } from '../../src/types/permissions'

export function testGetRoles (app: Application): void {
  let hubUserToken = ''
  const hubUserEmail = DefaultHubUsers[0].email
  const hubUserPwd = DefaultHubUsers[0].password

  let hubUserRole: PortalRoleEntity
  let viewRolesPermission: PortalPermissionEntity

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: hubUserEmail,
        password: hubUserPwd
      })
    hubUserToken = res.body.token

    // Hub User should have VIEW_ROLES permission
    hubUserRole = await AppDataSource.manager.findOneOrFail(PortalRoleEntity, { where: { name: DefaultHubUsers[0].role }, relations: ['permissions'] })
    viewRolesPermission = await AppDataSource.manager.findOneOrFail(PortalPermissionEntity, { where: { name: PermissionsEnum.VIEW_ROLES } })
    hubUserRole.permissions.push(viewRolesPermission)
    await AppDataSource.manager.save(hubUserRole)
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/api/v1/roles')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .get('/api/v1/roles')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 403 when user does not have required permissions', async () => {
    // Arrange - remove VIEW_ROLES permission from hubUser
    hubUserRole.permissions = hubUserRole.permissions.filter(p => p.id !== viewRolesPermission.id)
    await AppDataSource.manager.save(hubUserRole)

    // Act
    const res = await request(app)
      .get('/api/v1/roles')
      .set('Authorization', `Bearer ${hubUserToken}`)
    expect(res.statusCode).toEqual(403)
    expect(res.body.message).toEqual('Forbidden. \'View Roles\' permission is required.')

    // Restore VIEW_ROLES permission to hubUser
    hubUserRole.permissions.push(viewRolesPermission)
    await AppDataSource.manager.save(hubUserRole)
  })

  it('should respond with 200 and Roles array data with associated permissions', async () => {
    const res = await request(app)
      .get('/api/v1/roles')
      .set('Authorization', `Bearer ${hubUserToken}`)

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('OK')

    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data[0]).toHaveProperty('permissions')
    expect(res.body.data[0].permissions).toBeInstanceOf(Array)
  })
}
