import type {
  BusinessOwnerIDType,
  CurrencyCodes,
  MerchantLocationType,
  MerchantRegistrationStatus,
  MerchantType,
  NumberOfEmployees,
} from 'shared-lib'

interface CheckoutCounter {
  id: number
  description: string
  notification_number: string
  alias_type: string
  alias_value: string
  merchant_registry_id: number
  created_at: Date
  updated_at: Date
}

type BusinessOwner = {
  id: number
  name: string
  email: string
  phone_number: string
  identificaton_type: BusinessOwnerIDType
  identification_number: string
  businessPersonLocation: Location
  created_at: Date
  updated_at: Date
}

type ContactPerson = {
  id: number
  name: string
  email: string
  phone_number: string
  created_at: Date
  updated_at: Date
}

type Location = {
  id: number
  location_type: MerchantLocationType
  web_url: string
  address_type: string
  department: string
  sub_department: string
  street_name: string
  building_number: string
  building_name: string
  floor_number: string
  room_number: string
  post_box: string
  postal_code: string
  town_name: string
  district_name: string
  country_subdivision: string
  country: string
  address_line: string
  latitude: string
  longitude: string
  created_at: Date
  updated_at: Date
}

interface BusinessLicense {
  id: number
  license_number: string
  license_document_link: string
  created_at: string
  updated_at: string
}

interface CreatedBy {
  id: number
  name: string
  email: string
  phone_number: string
}

interface CategoryCode {
  category_code: string
  description: string
}

interface CurrencyCode {
  iso_code: CurrencyCodes
  description: string
}

export interface DFSP {
  id: number
  name: string
  dfsp_type: string
  logo_uri: string
  joined_date: string
  activated: boolean
  created_at: string
  updated_at: string
}

export interface MerchantDetails {
  id: number
  dba_trading_name: string
  registered_name: string
  employees_num: NumberOfEmployees
  monthly_turnover: string
  merchant_type: MerchantType
  category_code: CategoryCode
  currency_code: CurrencyCode
  allow_block_status: string
  registration_status: MerchantRegistrationStatus
  registration_status_reason: string | null
  created_at: string
  updated_at: string
  default_dfsp: DFSP
  dfsps: DFSP[]
  locations: Location[]
  checkout_counters: CheckoutCounter[]
  business_licenses: BusinessLicense[]
  contact_persons: ContactPerson[]
  created_by: CreatedBy
  business_owners: BusinessOwner[]
  checked_by: any
}
