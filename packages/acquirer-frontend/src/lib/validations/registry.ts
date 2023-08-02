import { z } from 'zod'
import { Countries } from 'shared-lib'

export type BusinessInfo = z.infer<typeof businessInfoSchema>
export type LocationInfo = z.infer<typeof locationInfoSchema>
export type OwnerInfo = z.infer<typeof ownerInfoSchema>
export type ContactPerson = z.infer<typeof contactPersonSchema>

export const businessInfoSchema = z.object({
  dbaName: z.string().nonempty({ message: 'Business name is required' }),
  registeredName: z.string().optional(),
  payintoAccount: z.string().nonempty({ message: 'Payinto account is required' }),
  numberOfEmployee: z.union([
    z.literal('1 - 10'),
    z.literal('11 - 50'),
    z.literal('51 - 100'),
    z.literal('100 +'),
  ]),
  monthlyTurnOver: z.string().optional(),
  merchantCategory: z.union([
    z.literal('individual'),
    z.literal('small-shop'),
    z.literal('chain-store'),
  ]),
  merchantType: z
    .union([z.literal('individual'), z.literal('small-shop'), z.literal('chain-store')])
    .or(z.null()),
  registeredDFSPName: z.string().optional(),
  currency: z.union([z.literal('USD'), z.literal('EUR'), z.literal('MMK')]).or(z.null()),
  haveBusinessLicense: z.union([z.literal('yes'), z.literal('no')]).or(z.undefined()),
  licenseNumber: z.string().optional(),
  licenseDocument: z.custom<File>(val => val instanceof File).or(z.null()),
})

export const locationInfoSchema = z.object({
  locationType: z.union([z.literal('physical'), z.literal('virtual')]),
  websiteUrl: z.string().optional(),
  department: z.string().optional(),
  subDepartment: z.string().optional(),
  streetName: z.string().optional(),
  buildingNumber: z.string().optional(),
  buildingName: z.string().optional(),
  floorNumber: z.string().optional(),
  roomNumber: z.string().optional(),
  postBox: z.string().optional(),
  postalCode: z.string().optional(),
  township: z.string().optional(),
  district: z.string().optional(),
  countrySubdivision: z.string().optional(),
  country: z.nativeEnum(Countries).or(z.null()),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  checkoutDescription: z.string().optional(),
})

export const ownerInfoSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  nationalId: z.string().nonempty({ message: 'National ID is required' }),
  nationality: z.string().nonempty({ message: 'Nationality is required' }),
  department: z.string().optional(),
  subDepartment: z.string().optional(),
  streetName: z.string().optional(),
  buildingNumber: z.string().optional(),
  buildingName: z.string().optional(),
  floorNumber: z.string().optional(),
  roomNumber: z.string().optional(),
  postBox: z.string().optional(),
  postalCode: z.string().optional(),
  township: z.string().optional(),
  district: z.string().optional(),
  countrySubdivision: z.string().optional(),
  physicalAddressCountry: z.nativeEnum(Countries),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  phoneNumber: z.string().nonempty({ message: 'Phone number is required' }),
  email: z.string().email().or(z.literal('')),
})

export const contactPersonSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  phoneNumber: z.string().nonempty({ message: 'Phone number is required' }),
  email: z.string().email().or(z.literal('')),
})
