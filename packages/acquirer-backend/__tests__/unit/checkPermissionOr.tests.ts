import { type NextFunction, type Response } from 'express'
import { type AuthRequest } from '../../src/types/express'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { PortalRoleEntity } from '../../src/entity/PortalRoleEntity'
import { PermissionsEnum } from '../../src/types/permissions'
import { PortalPermissionEntity } from '../../src/entity/PortalPermissionEntity'
import { checkPermissionsOr } from '../../src/middleware/checkPermissions'
import logger from '../../src/services/logger'

logger.silent = true
describe('checkPermissionsOr Middleware', () => {
  let mockReq: AuthRequest
  let mockRes: Response
  let mockNext: NextFunction
  let user: PortalUserEntity

  beforeEach(() => {
    // Initialize user with no permissions
    user = new PortalUserEntity()
    user.role = new PortalRoleEntity()

    // Mock the request object
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    mockReq = {
      user
    } as AuthRequest

    // Mock the response object methods
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    } as unknown as Response

    // Mock the next function
    mockNext = jest.fn()
  })

  it('should call next for user with one of the required permissions', () => {
    // Arrange
    const permission = new PortalPermissionEntity()
    permission.name = PermissionsEnum.APPROVE_MERCHANTS
    user.role.permissions = [permission]

    // Act
    const middleware = checkPermissionsOr([PermissionsEnum.APPROVE_MERCHANTS, PermissionsEnum.VIEW_MERCHANTS])

    // Assert
    middleware(mockReq, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalled()
  })

  it('should send 403 for user with no permissions', () => {
    // Arrange
    user.role = new PortalRoleEntity() // No permissions

    // Act
    const middleware = checkPermissionsOr([PermissionsEnum.APPROVE_MERCHANTS])

    // Assert
    middleware(mockReq, mockRes, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(403)
    expect(mockRes.send).toHaveBeenCalledWith({
      message: 'Forbidden'
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should send 403 for user without any of the required permissions', () => {
    const permission = new PortalPermissionEntity()
    permission.name = PermissionsEnum.APPROVE_MERCHANTS
    user.role.permissions = [permission]

    const middleware = checkPermissionsOr([PermissionsEnum.CREATE_DFSPS, PermissionsEnum.VIEW_DFSPS])
    middleware(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(403)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: `Forbidden. One of the following permissions is required: ${[PermissionsEnum.CREATE_DFSPS, PermissionsEnum.VIEW_DFSPS].join(', ')}.`
    })
    expect(mockNext).not.toHaveBeenCalled()
  })
})
