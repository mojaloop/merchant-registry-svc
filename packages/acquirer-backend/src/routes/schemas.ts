import {
  BusinessOwnerIDType, CurrencyCodes, MerchantLocationType,
  MerchantType,
  NumberOfEmployees
} from 'shared-lib'
import * as z from 'zod'

export const BusinessLicenseSubmitDataSchema = z.object({
  license_number: z.string(),
  license_document_link: z.string().url().nullable()
})

export const MerchantSubmitDataSchema = z.object({
  dba_trading_name: z.string().optional(),
  registered_name: z.string().optional().nullable().default(null),
  employees_num: z.nativeEnum(NumberOfEmployees).optional(),
  monthly_turnover: z.string().nullable().default(null),
  currency_code: z.nativeEnum(CurrencyCodes).optional(),
  category_code: z.string().optional(),
  merchant_type: z.nativeEnum(MerchantType).optional(),
  payinto_alias: z.string().optional(),
  license_number: z.string().optional().optional()
})

export const MerchantLocationSubmitDataSchema = z.object({
  location_type: z.nativeEnum(MerchantLocationType).optional(),
  country: z.string().optional(),
  web_url: z.string().optional(),
  address_type: z.string().optional(),
  department: z.string().optional(),
  sub_department: z.string().optional(),
  street_name: z.string().optional(),
  building_number: z.string().optional(),
  building_name: z.string().optional(),
  floor_number: z.string().optional(),
  room_number: z.string().optional(),
  post_box: z.string().optional(),
  postal_code: z.string().optional(),
  town_name: z.string().optional(),
  district_name: z.string().optional(),
  country_subdivision: z.string().optional(),
  address_line: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  checkout_description: z.string().optional()
})

export const ContactPersonSubmitDataSchema = z.object({
  name: z.string(),
  phone_number: z.string(),
  email: z.string().email().or(z.literal(null)),
  is_same_as_business_owner: z.boolean().default(false)
})

export const BusinessOwnerSubmitDataSchema = z.object({
  id: z.number().optional(), // only needed for updating
  name: z.string().optional(),
  email: z.string().email().or(z.null()).optional(),
  phone_number: z.string().optional(),
  identificaton_type: z.nativeEnum(BusinessOwnerIDType).optional(),
  identification_number: z.string().optional(),
  address_type: z.string().optional(),
  department: z.string().optional(),
  sub_department: z.string().optional(),
  street_name: z.string().optional(),
  building_number: z.string().optional(),
  building_name: z.string().optional(),
  floor_number: z.string().optional(),
  room_number: z.string().optional(),
  post_box: z.string().optional(),
  postal_code: z.string().optional(),
  town_name: z.string().optional(),
  district_name: z.string().optional(),
  country: z.string().optional(),
  country_subdivision: z.string().optional(),
  address_line: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional()
})
