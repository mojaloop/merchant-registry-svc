import { type NextFunction, type Response } from 'express'
import logger from '../../src/services/logger'
import { type AuthRequest } from '../../src/types/express'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { PortalRoleEntity } from '../../src/entity/PortalRoleEntity'
import { PortalPermissionEntity } from '../../src/entity/PortalPermissionEntity'
import { checkUserCreationPermission } from '../../src/middleware/checkUserCreationPermission'
import { PermissionsEnum } from '../../src/types/permissions'

logger.silent = true
const nextFunction: NextFunction = jest.fn()
let mockRequest: Partial<AuthRequest>
let mockResponse: Partial<Response>

jest.mock('../../src/utils/audit')
describe('checkUserCreationPermission Middleware', () => {
  let user: PortalUserEntity
  let createPortalUserPermission: PortalPermissionEntity

  beforeEach(() => {
    user = new PortalUserEntity()
    user.email = 'john@email.com'
    user.role = new PortalRoleEntity()

    createPortalUserPermission = new PortalPermissionEntity()
    createPortalUserPermission.name = PermissionsEnum.CREATE_PORTAL_USERS

    user.role.permissions = [createPortalUserPermission]
  })

  it('should call next() if user has required permission when creating DFSP Admin', async () => {
    const createDFSPAdminPermission = new PortalPermissionEntity()
    createDFSPAdminPermission.name = PermissionsEnum.CREATE_DFSP_ADMIN
    user.role.permissions.push(createDFSPAdminPermission)

    mockRequest = {
      user,
      body: { role: 'DFSP Admin' }
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    }

    const middleware = checkUserCreationPermission()
    await middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction)

    expect(nextFunction).toHaveBeenCalled()
  })

  it('should call next() if user has required permission when creating DFSP Operator', async () => {
    const createDFSPOperatorPermission = new PortalPermissionEntity()
    createDFSPOperatorPermission.name = PermissionsEnum.CREATE_DFSP_OPERATOR
    user.role.permissions.push(createDFSPOperatorPermission)

    mockRequest = {
      user,
      body: { role: 'DFSP Operator' }
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    }

    // Act
    const middlware = checkUserCreationPermission()
    await middlware(mockRequest as AuthRequest, mockResponse as Response, nextFunction)

    expect(nextFunction).toHaveBeenCalled()
  })

  it('should return 400 for invalid role', async () => {
    mockRequest = {
      user,
      body: { role: 'Invalid Role' }
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    }

    // Act
    await checkUserCreationPermission()(mockRequest as AuthRequest, mockResponse as Response, nextFunction)

    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Invalid role' })
  })

  it('should return 403 for insufficient permissions when need both CREATE_PORTAL_USERS and CREATE_DFSP_ADMIN', async () => {
    // Remove CREATE_DFSP_ADMIN permission
    user.role.permissions = [createPortalUserPermission]
    mockRequest = {
      user,
      body: { role: 'DFSP Admin' }
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    }

    // Act
    await checkUserCreationPermission()(mockRequest as AuthRequest, mockResponse as Response, nextFunction)

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(403)
    expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Insufficient permissions to create this role.' })
  })

  it('should return 401 for unauthorized access', async () => {
    mockRequest = { user: undefined, body: { role: 'DFSP Admin' } }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    }

    // Act
    await checkUserCreationPermission()(mockRequest as AuthRequest, mockResponse as Response, nextFunction)

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401)
    expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Unauthorized' })
  })
})
