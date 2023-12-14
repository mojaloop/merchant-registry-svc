import { vi } from 'vitest'

import {
  downloadMerchantsBlobAsXlsx,
  formatLatitudeLongitude,
  isTokenExpired,
  scrollToTop,
} from '.'

const fn = vi.fn()

afterEach(() => {
  fn.mockClear()
  vi.unstubAllGlobals()
})

describe('scrollToTop', () => {
  it('should scroll to top', () => {
    vi.stubGlobal('document', {
      getElementById: () => ({
        scrollTo: () => fn('scroll'),
      }),
    })

    scrollToTop()

    expect(fn.mock.calls[0]).toEqual(['scroll'])
  })
})

describe('formatLatitudeLongitude', () => {
  it('should return N/A if both latitude and longitude are undefined', () => {
    expect(formatLatitudeLongitude()).toBe('N/A')
  })

  it('should return latitude if longitude is undefined', () => {
    expect(formatLatitudeLongitude('1.2')).toBe('1.2')
  })

  it('should return longitude if latitude is undefined', () => {
    expect(formatLatitudeLongitude(undefined, '3.4')).toBe('3.4')
  })

  it('should return latitude and longitude if both are defined', () => {
    expect(formatLatitudeLongitude('1.2', '3.4')).toBe('1.2, 3.4')
  })
})

describe('downloadMerchantsBlobAsXlsx', () => {
  it('should download blob as xlsx', () => {
    vi.stubGlobal('URL', {
      createObjectURL: () => fn('createObjectURL'),
      revokeObjectURL: () => fn('revokeObjectURL'),
    })

    const blobData = new Blob(['data'])
    downloadMerchantsBlobAsXlsx(blobData)

    expect(fn.mock.calls[0]).toEqual(['createObjectURL'])
    expect(fn.mock.calls[1]).toEqual(['revokeObjectURL'])
  })
})

const mockJWTDecode = vi.fn()
vi.mock('jwt-decode', () => ({
  default: () => mockJWTDecode(),
}))

describe('isTokenExpired', () => {
  it('should return true if token is expired', () => {
    mockJWTDecode.mockReturnValue({ exp: 1 })

    expect(isTokenExpired('token')).toBe(true)
  })

  it('should return false if token is not expired', () => {
    mockJWTDecode.mockReturnValue({ exp: 999999999999999 })

    expect(isTokenExpired('token')).toBe(false)
  })
})
