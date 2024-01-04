import { z } from 'zod'

export type onboardDfspForm = z.infer<typeof onboardDfspSchema>

export const onboardDfspSchema = z.object({
    name: z.string().trim().min(1, { message: 'Dfsp name is required' }),
    type: z.string().min(1, 'Please select a dfsp type'),
    license_id: z.string().trim().min(1, { message: 'business license id is required' }),
    logo: z.custom<File>(val => val instanceof File),
    will_use_portal: z.union([z.literal('yes'), z.literal('no')]).or(z.undefined()),
    
})
