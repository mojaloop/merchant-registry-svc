import {
  BusinessOwnerIDType, Countries, MerchantAllowBlockStatus, MerchantLocationType,
  MerchantRegistrationStatus,
  MerchantType,
  NumberOfEmployees
} from 'shared-lib'
import * as z from 'zod'

export const BusinessPersonLocationSchema = z.object({
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
  country: z.nativeEnum(Countries).or(z.null()),
  address_line: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional()
})

export const MerchantLocationSchema = z.object({
  location_type: z.nativeEnum(MerchantLocationType, {
    errorMap: () => ({ message: 'Invalid location type' })
  }),

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
  country: z.nativeEnum(Countries).or(z.null()),
  address_line: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional()
})

export const CheckoutCounterSchema = z.object({
  description: z.string(),
  notification_number: z.string().nullable(),
  alias_type: z.literal('PAYINTO_ID'),
  alias_value: z.string().nonempty('PayIntoID Alias value is required')
})

export const CurrencySchema = z.object({
  iso_code: z.string(),
  description: z.string()
})

export const CategorySchema = z.object({
  category_code: z.string(),
  description: z.string()
})

export const BusinessLicenseSchema = z.object({
  license_number: z.string().nullable(),
  license_document_link: z.string().nullable()
})

export const BusinessOwnerSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().nullable(),
  phone_number: z.string().nonempty('Phone number is required'),
  identificaton_type: z.nativeEnum(BusinessOwnerIDType),
  identification_number: z.string(),
  businessPersonLocation: BusinessPersonLocationSchema
})

export const ContactPersonSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().nullable(),
  phone_number: z.string().nonempty('Phone number is required'),
  businessPersonLocation: BusinessPersonLocationSchema
})

export const MerchantCategorySchema = z.object({
  description: z.string()
})

export const MerchantSchema = z.object({
  dba_trading_name: z.string().nonempty('Doing Business As (DBA) name is required'),
  registered_name: z.string().nullable(),
  employees_num: z.nativeEnum(NumberOfEmployees, {
    errorMap: () => ({ message: 'Number of Employees is required' })
  }),

  monthly_turnover: z.string().nullable(),
  merchant_type: z.nativeEnum(MerchantType).nullable(),

  allow_block_status: z.nativeEnum(MerchantAllowBlockStatus),

  registration_status: z.nativeEnum(MerchantRegistrationStatus),
  registration_status_reason: z.string().optional(),

  currency_code: CurrencySchema,
  category_code: CategorySchema,
  checkout_counters: z.array(CheckoutCounterSchema).length(1, 'Checkout counter is required'),
  locations: z.array(MerchantLocationSchema).length(1, 'Location is required'),
  business_licenses: z.array(BusinessLicenseSchema),

  business_owners: z.array(BusinessOwnerSchema).length(1, 'Business owner info is required'),
  contact_persons: z.array(ContactPersonSchema).length(1, 'Contact person info is required')
})
