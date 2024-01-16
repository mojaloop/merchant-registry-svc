import { z } from 'zod'

export type AddNewUserForm = z.infer<typeof addNewUserSchema>

export const addNewUserSchema = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }),
  email: z.string().trim().email('Please enter a valid email'),
  role: z.string().min(1, 'Please select a role'),
  dfsp_id: z.number().optional(),
})
