import type { MerchantRegistrationStatus, MerchantType } from 'shared-lib'

export interface MerchantInfo {
  no: number
  dbaName: string
  registeredName: string
  payintoAccount: string
  merchantType: MerchantType
  state: string
  countrySubdivision: string
  counterDescription: string
  registeredDfspName: string
  registrationStatus: MerchantRegistrationStatus
  makerUsername: string
}
