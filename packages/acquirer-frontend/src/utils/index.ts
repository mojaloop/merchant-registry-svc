import type { MerchantInfo } from '@/types/merchants'
import type { MerchantDetails } from '@/types/merchantDetails'

export function scrollToTop() {
  document.getElementById('main')?.scrollTo({ top: 0, behavior: 'smooth' })
}

export function formatLatitudeLongitude(latitude?: string, longitude?: string) {
  if (!latitude && !longitude) return 'N/A'

  if (!latitude || !longitude) return latitude || longitude

  return `${latitude}, ${longitude}`
}

export function transformIntoTableData(merchantData: MerchantDetails): MerchantInfo {
  return {
    no: merchantData.id, // Assuming 'no' is the id of the merchant
    dbaName: merchantData.dba_trading_name,
    registeredName: merchantData.registered_name || 'N/A',

    // Assuming the first checkout counter's alias value is the payintoAccount
    payintoAccount: merchantData.checkout_counters[0]?.alias_value || 'N/A',
    merchantType: merchantData.merchant_type,

    // Assuming the first location's country subdivision is the state
    state: merchantData.locations[0]?.country_subdivision || 'N/A',
    countrySubdivision: merchantData.locations[0]?.town_name || 'N/A',

    // Assuming the first checkout counter's description is the counterDescription
    counterDescription: merchantData.checkout_counters[0]?.description || 'N/A',
    registeredDfspName: merchantData.default_dfsp.name,
    registrationStatus: merchantData.registration_status,
    maker: merchantData.created_by,
  }
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
