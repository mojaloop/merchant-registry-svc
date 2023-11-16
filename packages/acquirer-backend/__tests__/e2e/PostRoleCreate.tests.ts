/* eslint-disable max-len */
import request from 'supertest'
import { type Application } from 'express'
import { DefaultHubUsers } from '../../src/database/defaultUsers'
import { DefaultRoles } from '../../src/database/defaultRoles'
import { PermissionsEnum } from '../../src/types/permissions'

export function testPostRolecreate (app: Application): void {
  let hubUserToken = ''

  const hubUserEmail = DefaultHubUsers[0].email
  const hubUserPwd = DefaultHubUsers[0].password

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: hubUserEmail,
        password: hubUserPwd
      })
    hubUserToken = res.body.token
  })

  it('should respond with 401 when Authorization header is missing', async () => {
    const res = await request(app).post('/api/v1/roles')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 when Authorization token is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', 'Bearer invalid_token')
    expect(res.statusCode).toEqual(401)
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 400 when name field is missing', async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        description: 'test description',
        permissions: ['test_permission']
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Missing name field')
  })

  it('should respond with 400 when description field is missing', async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: 'test_role',
        permissions: ['test_permission']
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Missing description field')
  })

  it('should respond with 400 when permissions field is missing', async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: 'test_role',
        description: 'test description'
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Missing permissions field')
  })

  it('should respond with 400 when permissions field is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: 'test_role',
        description: 'test description',
        permissions: ['invalid_permission']
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid permissions')
  })

  it('should respond with 400 when permissions field is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: 'test_role',
        description: 'test description',
        permissions: [
          PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM,
          'invalid_permission',
          PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM
        ]
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Invalid permissions')
  })

  it('should respond with 400 when role already exists', async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: DefaultRoles[0].name,
        description: 'test description',
        permissions: [
          PermissionsEnum.ACCESS_EDIT_MERCHANT_FORM,
          PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM
        ]
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual('Role already exists')
  })

  it('should respond with 201 when role is created successfully', async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${hubUserToken}`)
      .send({
        name: 'new_test_role',
        description: 'test description',
        permissions: [
          PermissionsEnum.ACCESS_EDIT_MERCHANT_FORM,
          PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM
        ]
      })
    expect(res.statusCode).toEqual(201)
    expect(res.body.message).toEqual('Role created successfully')
  })
}
