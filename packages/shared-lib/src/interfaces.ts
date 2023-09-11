import { type MerchantAllowBlockStatus, type MerchantRegistrationStatus } from './enums'

export interface IMerchantSubmitData {
  id?: number // for continue updates after drafting
  dba_trading_name: string
  registered_name?: string
  employees_num: string
  monthly_turnover?: number
  allow_block_status: MerchantAllowBlockStatus
  registration_status: MerchantRegistrationStatus
  registration_status_reason?: string
  // created_by: number; // will be set by the backend
  // checked_by: number; // will be set by the backend
  currency_code: string
  category_code: string
  payinto_alias?: string // Will create a new CheckoutCounterEntity if provided.
  locations?: number[]
  // checkout_counters?: number[]
  business_licenses?: number[]
  business_owners?: number[]
  contact_persons?: number[]
  dfsp_merchant_relations?: number[]
}

export interface ILocationSubmitData {
  id?: number // for furthur updates
  address_type?: string
  department?: string
  sub_department?: string
  street_name?: string
  building_number?: string
  building_name?: string
  floor_number?: string
  room_number?: string
  post_box?: string
  postal_code?: string
  town_name?: string
  district_name?: string
  country_subdivision?: string
  country?: string
  address_line?: string
  latitude?: string
  longitude?: string
}
