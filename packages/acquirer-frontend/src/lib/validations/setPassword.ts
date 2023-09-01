import { z } from 'zod'

export type SetPasswordForm = z.infer<typeof setPasswordSchema>

export const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must contain at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must contain at least 8 characters'),
  })
  .refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
