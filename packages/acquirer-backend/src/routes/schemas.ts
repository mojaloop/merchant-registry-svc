import {
  BusinessOwnerIDType, Countries, CurrencyCodes, MerchantLocationType,
  MerchantRegistrationStatus,
  MerchantType,
  NumberOfEmployees
} from 'shared-lib'
import * as z from 'zod'

enum SubmitRegistratonStatus {
  DRAFT = MerchantRegistrationStatus.DRAFT,
  REVIEW = MerchantRegistrationStatus.REVIEW,
}

export const BusinessLicenseSubmitDataSchema = z.object({
  license_number: z.string(),
  license_document_link: z.string().url().nullable()
}).strict()

export const MerchantSubmitDataSchema = z.object({
  id: z.number().optional(), // only needed for updating
  dba_trading_name: z.string(),
  registered_name: z.string().optional().nullable().default(null),
  employees_num: z.nativeEnum(NumberOfEmployees),
  monthly_turnover: z.string().nullable().default(null),
  currency_code: z.nativeEnum(CurrencyCodes),
  category_code: z.string(),
  merchant_type: z.nativeEnum(MerchantType),
  registration_status: z.nativeEnum(SubmitRegistratonStatus),
  registration_status_reason: z.string(),
  payinto_alias: z.string().optional(),
  license_number: z.string().optional(),
  file: z.any().optional()

}).strict()

export const MerchantLocationSubmitDataSchema = z.object({
  location_type: z.nativeEnum(MerchantLocationType),
  country: z.nativeEnum(Countries),
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
  distinct_name: z.string().optional(),
  country_subdivision: z.string().optional(),
  address_line: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  checkout_counters: z.array(z.number()).optional() // The IDs of the associated checkout counters
}).strict()

export const ContactPersonSubmitDataSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone_number: z.string(),
  is_same_as_business_owner: z.boolean().default(false)
}).strict()

export const BusinessOwnerSubmitDataSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone_number: z.string(),
  identificaton_type: z.nativeEnum(BusinessOwnerIDType),
  identification_number: z.string()
}).strict()
