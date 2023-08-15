import { MerchantInfo, MerchantRecord } from '@/types/merchants'
import capitalize from 'lodash.capitalize'

export const convertKebabCaseToReadable = (snakeCaseString: string) => {
  return snakeCaseString
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

export const scrollToTop = () => {
  document.getElementById('main')?.scrollTo({ top: 0, behavior: 'smooth' })
}

export const transformIntoTableData = (merchantData: MerchantRecord): MerchantInfo => {
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
    registeredDfspName: 'N/A', // Not provided yet by API Backend Server
    registrationStatus: merchantData.registration_status,
  }
}
