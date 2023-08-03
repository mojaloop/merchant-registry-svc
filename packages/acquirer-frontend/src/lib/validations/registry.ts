import { z } from 'zod'

import {
  CurrencyCodes,
  NumberOfEmployees,
  MerchantLocationType,
  MerchantType,
  Countries,
  BusinessOwnerIDType,
} from 'shared-lib'

export type BusinessInfo = z.infer<typeof businessInfoSchema>
export type LocationInfo = z.infer<typeof locationInfoSchema>
export type OwnerInfo = z.infer<typeof ownerInfoSchema>
export type ContactPerson = z.infer<typeof contactPersonSchema>

export const businessInfoSchema = z.object({
  dba_trading_name: z.string().nonempty({ message: 'Business name is required' }),
  registered_name: z.string().optional(),
  payinto_alias: z.string().nonempty({ message: 'Payinto account is required' }),
  employees_num: z.nativeEnum(NumberOfEmployees),
  monthly_turnover: z.string().optional(),
  category_code: z.string().nonempty({ message: 'Category code is required' }),
  merchant_type: z.nativeEnum(MerchantType).or(z.null()),

  registeredDFSPName: z.string().optional(),
  currency_code: z.nativeEnum(CurrencyCodes),
  haveBusinessLicense: z.union([z.literal('yes'), z.literal('no')]).or(z.undefined()),
  license_number: z.string().optional(),
  licenseDocument: z.custom<File>(val => val instanceof File).or(z.null()),
})

export const locationInfoSchema = z.object({
  location_type: z.nativeEnum(MerchantLocationType),
  country: z.nativeEnum(Countries).or(z.null()),
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
  checkout_description: z.string().optional(),
})

export const ownerInfoSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  identification_number: z.string().nonempty({ message: 'National ID is required' }),
  identificaton_type: z.nativeEnum(BusinessOwnerIDType),
  department: z.string().optional(),
  sub_cepartment: z.string().optional(),
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
  country: z.nativeEnum(Countries),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  phone_number: z.string().nonempty({ message: 'Phone number is required' }),
  email: z.string().email().or(z.literal('')),
})

export const contactPersonSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  phone_number: z.string().nonempty({ message: 'Phone number is required' }),
  email: z.string().email().or(z.literal('')),
})
