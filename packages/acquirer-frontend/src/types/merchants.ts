import type { MerchantRegistrationStatus, MerchantType } from 'shared-lib'

import type { CreatedBy } from './merchantDetails'

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
  maker: CreatedBy
}
