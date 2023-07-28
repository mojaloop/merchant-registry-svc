import { z } from 'zod'

export type Login = z.infer<typeof loginSchema>

export const loginSchema = z.object({
  username: z.string().min(2, 'Username must contain at least 2 characters'),
  password: z.string().min(6, 'Password must contain at least 6 characters'),
})
