import { z } from 'zod'
import { MerchantRegistrationStatus } from 'shared-lib'

export type AllMerchantsFilterForm = z.infer<typeof allMerchantsFilterSchema>

export const allMerchantsFilterSchema = z.object({
  addedBy: z.string().optional(),
  approvedBy: z.string().optional(),
  addedTime: z.string().optional(),
  updatedTime: z.string().optional(),
  dbaName: z.string().optional(),
  merchantId: z.string().optional(),
  payintoAccountId: z.string().optional(),
  registrationStatus: z.nativeEnum(MerchantRegistrationStatus).or(z.null()),
})
