import jwt_decode from 'jwt-decode'

import type { Decoded } from '@/types/auth'

export function scrollToTop() {
  document.getElementById('main')?.scrollTo({ top: 0, behavior: 'smooth' })
}

export function formatLatitudeLongitude(latitude?: string, longitude?: string) {
  if (!latitude && !longitude) return 'N/A'

  if (!latitude || !longitude) return latitude || longitude

  return `${latitude}, ${longitude}`
}

export function downloadMerchantsBlobAsXlsx(blobData: Blob) {
  const url = URL.createObjectURL(blobData)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'merchants.xlsx')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Revoke the Object URL when it's no longer needed
  URL.revokeObjectURL(url)
}

export function isTokenExpired(token: string) {
  const decoded: Decoded = jwt_decode(token)
  const expirationTimestamp = decoded.exp * 1000
  return expirationTimestamp <= Date.now()
}
