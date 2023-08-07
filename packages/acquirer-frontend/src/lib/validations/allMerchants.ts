import { z } from 'zod'
import { MerchantRegistrationStatus } from 'shared-lib'

export type AllMerchants = z.infer<typeof allMerchantsSchema>

export const allMerchantsSchema = z.object({
  addedBy: z.string().optional(),
  approvedBy: z.string().optional(),
  addedTime: z.string().optional(),
  updatedTime: z.string().optional(),
  dbaName: z.string().optional(),
  merchantId: z.string().optional(),
  payintoId: z.string().optional(),
  registrationStatus: z.nativeEnum(MerchantRegistrationStatus).optional(),
})
