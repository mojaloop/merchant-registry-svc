import { type NextFunction, type Response } from 'express'
import { type AuthRequest } from '../../src/types/express'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { PortalRoleEntity } from '../../src/entity/PortalRoleEntity'
import { checkPermissions } from '../../src/middleware/checkPermissions'
import { PermissionsEnum } from '../../src/types/permissions'
import { PortalPermissionEntity } from '../../src/entity/PortalPermissionEntity'
import logger from '../../src/services/logger'

logger.silent = true
describe('checkPermissions Middleware', () => {
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

  it('should send 403 Forbidden with null user', () => {
    mockReq.user = undefined
    const middleware = checkPermissions(PermissionsEnum.APPROVE_MERCHANTS)
    middleware(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(403)
    expect(mockRes.send).toHaveBeenCalledWith({
      message: 'Forbidden'
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should call next for user with required permission', () => {
    const permission = new PortalPermissionEntity()
    permission.name = PermissionsEnum.APPROVE_MERCHANTS
    user.role.permissions = [permission]

    const middleware = checkPermissions(PermissionsEnum.APPROVE_MERCHANTS)
    middleware(mockReq, mockRes, mockNext)
    expect(mockNext).toHaveBeenCalled()
  })

  it('should send 403 for user with no permissions', () => {
    user.role = new PortalRoleEntity() // No permissions
    const middleware = checkPermissions(PermissionsEnum.APPROVE_MERCHANTS)
    middleware(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(403)
    expect(mockRes.send).toHaveBeenCalledWith({
      message: 'Forbidden'
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should send 403 for user without required permission', () => {
    const permission = new PortalPermissionEntity()
    permission.name = PermissionsEnum.APPROVE_MERCHANTS
    user.role.permissions = [permission]

    const middleware = checkPermissions(PermissionsEnum.CREATE_DFSPS)
    middleware(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(403)
    expect(mockRes.json).toHaveBeenCalledWith({
      message: `Forbidden. '${PermissionsEnum.CREATE_DFSPS}' permission is required.`
    })
    expect(mockNext).not.toHaveBeenCalled()
  })
})
