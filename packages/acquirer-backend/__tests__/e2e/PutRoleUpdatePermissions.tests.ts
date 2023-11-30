/* eslint-disable max-len */
import request from 'supertest'
import { type Application } from 'express'
import { DefaultHubUsers } from '../../src/database/defaultUsers'
import { PermissionsEnum } from '../../src/types/permissions'
import { AppDataSource } from '../../src/database/dataSource'
import { PortalRoleEntity } from '../../src/entity/PortalRoleEntity'
import { PortalPermissionEntity } from '../../src/entity/PortalPermissionEntity'

export function testPutRoleUpdatePermissions (app: Application): void {
  let hubUserToken = ''

  const hubUserEmail = DefaultHubUsers[0].email
  const hubUserPwd = DefaultHubUsers[0].password
  let roleId = 0

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: hubUserEmail,
        password: hubUserPwd
      })
    hubUserToken = res.body.token

    // Hub User should have EDIT_ROLES permission
    const hubUserRole = await AppDataSource.manager.findOneOrFail(PortalRoleEntity, { where: { name: DefaultHubUsers[0].role }, relations: ['permissions'] })
    const editRolePermission = await AppDataSource.manager.findOneOrFail(PortalPermissionEntity, { where: { name: PermissionsEnum.EDIT_ROLES } })
    hubUserRole.permissions.push(editRolePermission)
    await AppDataSource.manager.save(hubUserRole)

    const role = await AppDataSource.manager.findOneOrFail(PortalRoleEntity, { where: { name: 'DFSP Super Admin' } })
    roleId = role.id
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app).put(`/api/v1/roles/${roleId}`)
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .put(`/api/v1/roles/${roleId}`)
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 422 status when id is not a number', async () => {
    const res = await request(app)
      .put('/api/v1/roles/invalid')
      .set('Authorization', `Bearer ${hubUserToken}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid ID')
  })

  it('should respond with 422 status when id is less than 1', async () => {
    const res = await request(app)
      .put('/api/v1/roles/0')
      .set('Authorization', `Bearer ${hubUserToken}`)
    expect(res.statusCode).toEqual(422)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Invalid ID')
  })

  it('should respond with 400 when permissions field is missing', async () => {
    const res = await request(app)
      .put(`/api/v1/roles/${roleId}`)
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({})
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Missing permissions field')
  })

  it('should respond with 404 status when merchant does not exist', async () => {
    const res = await request(app)
      .put('/api/v1/roles/9999999')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        permissions: [PermissionsEnum.VIEW_MERCHANTS]
      })
    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Role does not exist')
  })

  it('should respond with 400 when permissions field is invalid', async () => {
    const res = await request(app)
      .put(`/api/v1/roles/${roleId}`)
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        permissions: ['invalid_permission']
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid permissions. At least one of the permissions does not exist')
  })

  it('should respond with 200 when permissions field is valid', async () => {
    // Act
    const res = await request(app)
      .put(`/api/v1/roles/${roleId}`)
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        permissions: [PermissionsEnum.VIEW_MERCHANTS]
      })

    // Assert
    // expect(res.statusCode).toEqual(200)
    expect(res.body.message).toEqual('Role updated successfully')
  })
}
