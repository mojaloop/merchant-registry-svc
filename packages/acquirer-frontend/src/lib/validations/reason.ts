import { z } from 'zod'

export type ReasonForm = z.infer<typeof reasonSchema>

export const reasonSchema = z.object({
  reason: z.string().optional(),
})
