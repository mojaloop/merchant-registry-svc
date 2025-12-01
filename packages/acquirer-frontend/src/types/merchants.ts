import type { MerchantRegistrationStatus, MerchantType } from 'shared-lib'

import type { CreatedBy } from './merchantDetails'

export interface MerchantInfo {
  no: number
  dbaName: string
  registeredName: string
  lei: string | null
  payintoAccountId: string
  merchantType: MerchantType
  town: string
  countrySubdivision: string
  counterDescription: string
  registeredDfspName: string
  registrationStatus: MerchantRegistrationStatus
  maker: CreatedBy
  gleif_verified_at?: string | null
}
