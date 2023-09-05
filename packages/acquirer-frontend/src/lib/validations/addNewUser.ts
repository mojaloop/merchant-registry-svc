import { z } from 'zod'

export type AddNewUserForm = z.infer<typeof addNewUserSchema>

export const addNewUserSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  email: z.string().email('Please enter a valid email'),
  role: z.union([z.literal('Admin User'), z.literal('Operator'), z.literal('Auditor')]),
})
