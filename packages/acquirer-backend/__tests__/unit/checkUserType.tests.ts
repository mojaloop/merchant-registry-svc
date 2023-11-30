import { PortalUserType } from 'shared-lib'
import { type AuthRequest } from '../../src/types/express'
import { checkPortalUserType } from '../../src/middleware/checkUserType'
import logger from '../../src/services/logger'

logger.silent = true
describe('checkPortalUserType Middleware', () => {
  const mockSend = jest.fn()
  const mockStatus = jest.fn().mockReturnValue({ send: mockSend })
  const mockNext = jest.fn()
  const mockRes: any = {
    status: mockStatus
  }
  const mockReq = {
    user: { user_type: '' } // This will be set in each test
  } as unknown as AuthRequest

  it('should call next for allowed user type', () => {
    const userType = PortalUserType.HUB
    // ignore undefined
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mockReq.user!.user_type = userType
    const middleware = checkPortalUserType(userType)

    middleware(mockReq, mockRes, mockNext)

    expect(mockStatus).not.toHaveBeenCalled()
    expect(mockSend).not.toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalled()
  })

  it('should send 403 for forbidden user type', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mockReq.user!.user_type = PortalUserType.DFSP
    const requiredUserType = PortalUserType.HUB
    const middleware = checkPortalUserType(requiredUserType)

    middleware(mockReq, mockRes, mockNext)

    expect(mockStatus).toHaveBeenCalledWith(403)
    expect(mockSend).toHaveBeenCalledWith({ message: 'Forbidden. DFSP User is not allowed.' })
  })
})
