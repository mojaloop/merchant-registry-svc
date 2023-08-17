import { z } from 'zod'

export type MerchantsFilterForm = z.infer<typeof merchantsFilterSchema>

export const merchantsFilterSchema = z.object({
  addedBy: z.string().optional(),
  approvedBy: z.string().optional(),
  addedTime: z.string().optional(),
  updatedTime: z.string().optional(),
  dbaName: z.string().optional(),
  merchantId: z.string().optional(),
  payintoId: z.string().optional(),
})
