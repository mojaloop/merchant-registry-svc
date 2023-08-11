import type { MerchantRegistrationStatus, MerchantType } from 'shared-lib'

import type { DraftData } from './form'

export interface PendingMerchantInfo {
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

export interface PendingMerchantRecord extends Required<DraftData> {
  id: number
}
