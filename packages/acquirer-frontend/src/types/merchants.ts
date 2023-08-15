import type { MerchantRegistrationStatus, MerchantType } from 'shared-lib'

import type { DraftData } from './form'

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
}

export interface MerchantRecord extends Required<DraftData> {
  id: number
}
