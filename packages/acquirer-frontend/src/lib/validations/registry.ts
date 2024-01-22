import { z } from 'zod'
import {
  BusinessOwnerIDType,
  CurrencyCodes,
  MerchantLocationType,
  MerchantType,
  NumberOfEmployees,
} from 'shared-lib'

export type BusinessInfoForm = z.infer<typeof businessInfoSchema>
export type LocationInfoForm = z.infer<typeof locationInfoSchema>
export type OwnerInfoForm = z.infer<typeof ownerInfoSchema>
export type ContactPersonForm = z.infer<typeof contactPersonSchema>

export const businessInfoSchema = z
  .object({
    dba_trading_name: z.string().trim().min(1, { message: 'Business name is required' }),
    registered_name: z.string().optional(),
    // payinto_alias: z.string().min(1, { message: 'Payinto account is required' }),
    employees_num: z.nativeEnum(NumberOfEmployees, {
      errorMap: () => ({ message: 'Please select an option' }),
    }),
    monthly_turnover: z.string().optional(),
    category_code: z
      .string()
      .trim()
      .min(1, { message: 'Please select a merchant category' }),
    merchant_type: z.nativeEnum(MerchantType, {
      errorMap: () => ({ message: 'Please select a merchant type' }),
    }),
    currency_code: z.nativeEnum(CurrencyCodes, {
      errorMap: () => ({ message: 'Please select a currency' }),
    }),
    account_number: z.string().optional(),
    have_business_license: z.union([z.literal('yes'), z.literal('no')]).or(z.undefined()),
    license_number: z.string().optional(),
    license_document: z.custom<File>(val => val instanceof File).or(z.null()),
  })
  .refine(
    data => {
      // If have_business_license is 'yes', ensure license_number is defined and not empty
      if (data.have_business_license === 'yes') {
        return data.license_number?.trim() ? true : false
      }
      // If have_business_license is 'no' or undefined, refinement passes
      return true
    },
    {
      message: 'License Number is required',
      path: ['license_number'],
    }
  )

export const locationInfoSchema = z.object({
  location_type: z.nativeEnum(MerchantLocationType, {
    errorMap: () => ({ message: 'Please select a location type' }),
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
  country: z.string().optional(),
  town_name: z.string().optional(),
  district_name: z.string().optional(),
  country_subdivision: z.string().optional(),
  address_line: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  checkout_description: z.string().optional(),
})

export const ownerInfoSchema = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }),
  identification_number: z
    .string()
    .trim()
    .min(1, { message: 'Identification number is required' }),
  identificaton_type: z.nativeEnum(BusinessOwnerIDType, {
    errorMap: () => ({ message: 'Please select an ID type' }),
  }),
  phone_number: z
    .string()
    .trim()
    .regex(/^[0-9+-]*$/, 'Please enter a valid phone number')
    .min(1, { message: 'Phone number is required' }),
  email: z.string().email().or(z.literal(null)).or(z.literal('')),
  department: z.string().optional(),
  sub_department: z.string().optional(),
  street_name: z.string().optional(),
  building_number: z.string().optional(),
  building_name: z.string().optional(),
  floor_number: z.string().optional(),
  room_number: z.string().optional(),
  post_box: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  town_name: z.string().optional(),
  district_name: z.string().optional(),
  country_subdivision: z.string().optional(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
})

export const contactPersonSchema = z.object({
  is_same_as_business_owner: z.boolean(),
  name: z.string().trim().min(1, { message: 'Name is required' }),
  phone_number: z
    .string()
    .trim()
    .regex(/^[0-9+-]*$/, 'Please enter a valid phone number')
    .min(1, { message: 'Phone number is required' }),
  email: z.string().email().or(z.literal(null)).or(z.literal('')),
})
