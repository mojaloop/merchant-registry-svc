import { z } from 'zod'

export type PendingMerchants = z.infer<typeof pendingMerchantsSchema>

export const pendingMerchantsSchema = z.object({
  addedBy: z.string().optional(),
  approvedBy: z.string().optional(),
  addedTime: z.string().optional(),
  updatedTime: z.string().optional(),
  dbaName: z.string().optional(),
  merchantId: z.string().optional(),
  payintoId: z.string().optional(),
})
