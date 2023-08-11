import type { MerchantRegistrationStatus, MerchantType } from 'shared-lib'

import type { DraftData } from './form'

export interface AllMerchantInfo {
  no: number
  dbaName: string
  registeredName: string
  payintoAccount: string
  merchantType: MerchantType
  state: string
  city: string
  counterDescription: string
  registeredDfspName: string
  registrationStatus: MerchantRegistrationStatus
}

export interface AllMerchantRecord extends Required<DraftData> {
  id: number
}
