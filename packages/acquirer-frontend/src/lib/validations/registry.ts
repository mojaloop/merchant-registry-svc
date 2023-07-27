import { z } from 'zod'

export type BusinessInfo = z.infer<typeof businessInfoSchema>

export const businessInfoSchema = z.object({
  businessName: z.string().nonempty({ message: 'Business name is required' }),
  registeredName: z.string(),
  payintoAccount: z.string(),
  numberOfEmployee: z.union([
    z.literal('1 - 10'),
    z.literal('11 - 50'),
    z.literal('51 - 100'),
    z.literal('100 +'),
  ]),
  monthlyTurnOver: z.string(),
  merchantCategory: z.union([
    z.literal('individual'),
    z.literal('small-shop'),
    z.literal('chain-store'),
  ]),
  merchantType: z.union([
    z.union([z.literal('individual'), z.literal('small-shop'), z.literal('chain-store')]),
    z.null(),
  ]),
  registeredDFSPName: z.string(),
  currency: z.union([
    z.union([z.literal('USD'), z.literal('EUR'), z.literal('MMK')]),
    z.null(),
  ]),
  haveBusinessLicense: z.union([
    z.union([z.literal('yes'), z.literal('no')]),
    z.undefined(),
  ]),
  licenseNumber: z.string(),
  licenseDocument: z.union([z.custom<File>(val => val instanceof File), z.null()]),
})
