import { z } from 'zod'

export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
})
