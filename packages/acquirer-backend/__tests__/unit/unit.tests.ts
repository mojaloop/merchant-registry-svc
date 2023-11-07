import fs from 'fs'
import path from 'path'
import { generateQRImage } from '../../src/services/generateQRImage'
import { type AuthRequest } from '../../src/types/express'
import { PortalUserType } from 'shared-lib'
import { checkUserUserType } from '../../src/middleware/checkUserType'
import { type Response, type NextFunction } from 'express'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'
import { PermissionsEnum } from '../../src/types/permissions'
import { checkPermissions, checkPermissionsOr } from '../../src/middleware/checkPermissions'
import { PortalPermissionEntity } from '../../src/entity/PortalPermissionEntity'
import { PortalRoleEntity } from '../../src/entity/PortalRoleEntity'

describe('Unit Tests', () => {
  describe('generateQRImage', () => {
    const sampleText = 'Hello, QR!'

    it('should generate a QR code without a frame', async () => {
      const result = await generateQRImage(sampleText)
      expect(result).toBeInstanceOf(Buffer)
      // Optionally, save this to a file for manual inspection?
      // fs.writeFileSync('./qr_with_frame.png', result);
    }, 30000)

    it('should generate a QR code with a frame', async () => {
      const frameImagePath = path.join(__dirname, '../test-files/frame.png')

      const result = await generateQRImage(sampleText, undefined, frameImagePath)
      expect(result).toBeInstanceOf(Buffer)
    // Optionally, save this to a file for manual inspection?
    // fs.writeFileSync('./qr_with_frame.png', result);
    }, 30000)

    it('should throw an error if frame image path is invalid', async () => {
    // An invalid path for testing
      const invalidFrameImagePath = './invalid-path.png'

      await expect(generateQRImage(sampleText, undefined, invalidFrameImagePath))
        .rejects
        .toThrow(`Frame image not found: ${invalidFrameImagePath}`)
    }, 30000)
  })

  describe('checkUserUserType Middleware', () => {
    const mockSend = jest.fn()
    const mockStatus = jest.fn().mockReturnValue({ send: mockSend })
    const mockNext = jest.fn()
    const mockRes = {
      status: mockStatus
    } as unknown as Response
    const mockReq = {
      user: { user_type: '' } // This will be set in each test
    } as unknown as AuthRequest

    it('should call next for allowed user type', () => {
      const userType = PortalUserType.HUB
      // ignore undefined
      mockReq.user!.user_type = userType
      const middleware = checkUserUserType(userType)

      middleware(mockReq, mockRes, mockNext)

      expect(mockStatus).not.toHaveBeenCalled()
      expect(mockSend).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalled()
    })

    it('should send 403 for forbidden user type', () => {
      mockReq.user!.user_type = PortalUserType.DFSP
      const requiredUserType = PortalUserType.HUB
      const middleware = checkUserUserType(requiredUserType)

      middleware(mockReq, mockRes, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith({ message: 'Forbidden. DFSP User is not allowed.' })
    })
  })

  describe('Permissions Middleware', () => {
    let mockReq: AuthRequest
    let mockRes: Response
    let mockNext: NextFunction
    let user: PortalUserEntity

    beforeEach(() => {
      // Initialize user with no permissions
      user = new PortalUserEntity()
      user.role = new PortalRoleEntity()

      // Mock the request object
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

    describe('checkPermissions Middleware', () => {
      // if (user?.role?.permissions == null) {
      //   return res.status(403).send({ message: 'Forbidden' })
      // }

      it('should send 403 Forbidden with null user', () => {
        mockReq.user = undefined
        const middleware = checkPermissions(PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM)
        middleware(mockReq, mockRes, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(403)
        expect(mockRes.send).toHaveBeenCalledWith({
          message: 'Forbidden'
        })
        expect(mockNext).not.toHaveBeenCalled()
      })

      it('should call next for user with required permission', () => {
        const permission = new PortalPermissionEntity()
        permission.name = PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM
        user.role.permissions = [permission]

        const middleware = checkPermissions(PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM)
        middleware(mockReq, mockRes, mockNext)
        expect(mockNext).toHaveBeenCalled()
      })

      it('should send 403 for user with no permissions', () => {
        user.role = new PortalRoleEntity() // No permissions
        const middleware = checkPermissions(PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM)
        middleware(mockReq, mockRes, mockNext)

        expect(mockRes.status).toHaveBeenCalledWith(403)
        expect(mockRes.send).toHaveBeenCalledWith({
          message: 'Forbidden'
        })
        expect(mockNext).not.toHaveBeenCalled()
      })

      it('should send 403 for user without required permission', () => {
        const permission = new PortalPermissionEntity()
        permission.name = PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM
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

    describe('checkPermissionsOr Middleware', () => {
      it('should call next for user with one of the required permissions', () => {
        // Arrange
        const permission = new PortalPermissionEntity()
        permission.name = PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM
        user.role.permissions = [permission]

        // Act
        const middleware = checkPermissionsOr([PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM, PermissionsEnum.ACCESS_EDIT_MERCHANT_FORM])

        // Assert
        middleware(mockReq, mockRes, mockNext)

        expect(mockNext).toHaveBeenCalled()
      })

      it('should send 403 for user with no permissions', () => {
        // Arrange
        user.role = new PortalRoleEntity() // No permissions

        // Act
        const middleware = checkPermissionsOr([PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM])

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
        permission.name = PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM
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
  })
})
