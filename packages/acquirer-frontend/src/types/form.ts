import type {
  BusinessOwnerIDType,
  Countries,
  CurrencyCodes,
  MerchantLocationType,
  MerchantRegistrationStatus,
  MerchantType,
  NumberOfEmployees,
} from 'shared-lib'

export interface FormReponse {
  data: {
    id: number
  }
  message: string
}

export interface DraftData {
  dba_trading_name?: string
  registered_name?: string
  checkout_counters?: {
    alias_value?: string
    description?: string
  }[]
  employees_num?: NumberOfEmployees
  monthly_turnover?: string
  category_code?: {
    category_code?: string
    description?: string
  }
  merchant_type?: MerchantType
  dfsp_name?: string
  currency_code?: {
    iso_code?: CurrencyCodes
  }
  business_licenses?: [
    {
      license_number?: string
      license_document_link?: string
    },
  ]
  locations?: {
    id?: number
    location_type?: MerchantLocationType
    web_url?: string
    department?: string
    sub_department?: string
    street_name?: string
    building_number?: string
    building_name?: string
    floor_number?: string
    room_number?: string
    post_box?: string
    postal_code?: string
    country?: Countries | '' | null
    town_name?: string
    district_name?: string
    country_subdivision?: string
    latitude?: string
    longitude?: string
  }[]
  business_owners?: {
    id?: number
    name?: string
    identificaton_type?: BusinessOwnerIDType
    identification_number?: string
    businessPersonLocation?: {
      department?: string
      sub_department?: string
      street_name?: string
      building_number?: string
      building_name?: string
      floor_number?: string
      room_number?: string
      post_box?: string
      postal_code?: string
      country?: Countries
      town_name?: string
      district_name?: string
      country_subdivision?: string
      latitude?: string
      longitude?: string
    }
    phone_number?: string
    email?: string | null
  }[]
  contact_persons?: {
    id?: number
    name?: string
    phone_number?: string
    email?: string | null
  }[]
  registration_status: MerchantRegistrationStatus
}
