import { z } from 'zod'
import { Countries } from 'shared-lib'

export type BusinessInfo = z.infer<typeof businessInfoSchema>
export type LocationInfo = z.infer<typeof locationInfoSchema>

export const businessInfoSchema = z.object({
  businessName: z.string().nonempty({ message: 'Business name is required' }),
  registeredName: z.string().optional(),
  payintoAccount: z.string().optional(),
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
  country: z.nativeEnum(Countries).or(z.null()),
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
  physicalAddressCountry: z.nativeEnum(Countries),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  checkoutDescription: z.string().optional(),
})
