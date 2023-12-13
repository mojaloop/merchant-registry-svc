import { type Application } from 'express'
import { DefaultDFSPUsers, DefaultHubUsers } from '../../src/database/defaultUsers'
import request from 'supertest'
import { AppDataSource } from '../../src/database/dataSource'
import { PortalRoleEntity } from '../../src/entity/PortalRoleEntity'
import { PortalPermissionEntity } from '../../src/entity/PortalPermissionEntity'
import { PermissionsEnum } from '../../src/types/permissions'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { PortalUserStatus } from 'shared-lib'

export function testPutUserStatus (app: Application): void {
  let token = ''
  const hubUserEmail = DefaultHubUsers[0].email
  const hubUserPwd = DefaultHubUsers[0].password
  const hubUserRole = DefaultHubUsers[0].role

  const dfspUserEmail = DefaultDFSPUsers[0].email
  let dfspUserId: number

  const portalRoleRepository = AppDataSource.getRepository(PortalRoleEntity)
  const permissionRepository = AppDataSource.getRepository(PortalPermissionEntity)

  beforeAll(async () => {
    const res = await request(app).post('/api/v1/users/login').send({
      email: hubUserEmail,
      password: hubUserPwd
    })
    token = res.body.token
    const dfspUser = await AppDataSource.manager.findOneOrFail(PortalUserEntity, {
      where: { email: dfspUserEmail },
      select: ['id']
    })
    dfspUserId = dfspUser.id

    const role = await portalRoleRepository.findOneOrFail({ where: { name: hubUserRole }, relations: ['permissions'] })
    const editStatusPermission = await permissionRepository.findOneOrFail({
      where: { name: PermissionsEnum.EDIT_PORTAL_USERS_STATUS }
    })

    role.permissions.push(editStatusPermission)
    await portalRoleRepository.save(role)
  })

  it('should respond with 403 when user does not have EDIT_PORTAL_USERS_STATUS permission', async () => {
    // Arrange
    const role = await portalRoleRepository.findOneOrFail({ where: { name: hubUserRole }, relations: ['permissions'] })
    const originalRolePermissions = [...role.permissions]
    role.permissions = role.permissions.filter(
      (permission) => permission.name !== PermissionsEnum.EDIT_PORTAL_USERS_STATUS
    )
    await portalRoleRepository.save(role)

    const res = await request(app).put(`/api/v1/users/${dfspUserId}/status`).set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(403)
    expect(res.body.message).toEqual("Forbidden. 'Edit Portal Users Status' permission is required.")

    // Restore
    role.permissions = originalRolePermissions
    await portalRoleRepository.save(role)
  })

  it('should respond with 404 when user not found', async () => {
    // Arrange
    const res = await request(app).put('/api/v1/users/9999990999/status').set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toEqual(404)
    expect(res.body.message).toEqual('User Not Found')
  })

  it('should respond with 422 when status is invalid', async () => {
    // Act
    const res = await request(app)
      .put(`/api/v1/users/${dfspUserId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'invalid-status' })
    expect(res.statusCode).toEqual(422)
    expect(res.body.message).toEqual('Invalid Status')
  })

  it('should respond with 422 when trying to change own status', async () => {
    const ownHubUser = await AppDataSource.manager.findOneOrFail(PortalUserEntity, {
      where: { email: hubUserEmail },
      select: ['id']
    })

    // Act
    const res = await request(app)
      .put(`/api/v1/users/${ownHubUser.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: PortalUserStatus.BLOCKED })
    expect(res.statusCode).toEqual(422)
    expect(res.body.message).toEqual('Cannot change own status')
  })

  it('should respond with 200 when status is valid', async () => {
    // Act
    const res = await request(app)
      .put(`/api/v1/users/${dfspUserId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: PortalUserStatus.BLOCKED })
    expect(res.statusCode).toEqual(200)
    expect(res.body.message).toEqual('Update User Status Successful')

    // Restore
    await AppDataSource.manager.update(PortalUserEntity, { id: dfspUserId }, { status: PortalUserStatus.ACTIVE })
  })
}
