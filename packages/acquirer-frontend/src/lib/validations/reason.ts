import { z } from 'zod'

export type ReasonForm = z.infer<typeof reasonSchema>

export const reasonSchema = z.object({
  reason: z.string().min(1, { message: 'Please enter a reason' }),
})
