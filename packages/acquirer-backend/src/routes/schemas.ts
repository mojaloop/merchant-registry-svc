import { BusinessOwnerIDType, Countries, MerchantLocationType } from 'shared-lib'
import * as z from 'zod'

export const MerchantSubmitDataSchema = z.object({
  id: z.number().optional(),
  dba_trading_name: z.string().optional(),
  registered_name: z.string(),
  employees_num: z.string(),
  monthly_turnover: z.number().optional(),
  payinto_alias: z.string().optional(),

  // Will be default to 'PENDING' during submission/drafting
  // Status will be updated by the separate API route
  // allow_block_status: z.nativeEnum(MerchantAllowBlockStatus),

  // Will be default to 'DRAFT'
  // Status will be updated by the separate API route
  // registration_status: z.nativeEnum(MerchantRegistrationStatus).optional(),

  registration_status_reason: z.string().optional(),
  currency_code: z.string(),
  category_code: z.string(),
  locations: z.array(z.number()).optional(),
  checkout_counters: z.array(z.number()).optional(),
  business_licenses: z.array(z.number()).optional(),
  business_owners: z.array(z.number()).optional(),
  contact_persons: z.array(z.number()).optional(),
  dfsp_merchant_relations: z.array(z.number()).optional()
}).strict()

export const MerchantLocationSubmitDataSchema = z.object({
  location_type: z.nativeEnum(MerchantLocationType),
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
  country: z.nativeEnum(Countries),
  address_line: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  merchant: z.number().optional(), // The ID of the associated merchant
  checkout_counters: z.array(z.number()).optional() // The IDs of the associated checkout counters
}).strict()

export const ContactPersonSubmitDataSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone_number: z.string()
}).strict()

export const BusinessOwnerSubmitDataSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone_number: z.string(),
  identificaton_type: z.nativeEnum(BusinessOwnerIDType),
  identification_number: z.string()
}).strict()
