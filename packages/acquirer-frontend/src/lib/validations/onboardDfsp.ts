import { z } from 'zod'

export type onboardDfspForm = z.infer<typeof onboardDfspSchema>

export const onboardDfspSchema = z.object({
  fspId: z.string().trim().min(1, { message: 'DFSP ID is required' }),
  name: z.string().trim().min(1, { message: 'DFSP Name is required' }),
  dfspType: z.string().min(1, 'Please select a DFSP Type'),
  businessLicenseId: z
    .string()
    .trim()
    .min(1, { message: 'business license id is required' }),
  logo: z
    .any() // Use any() to allow for file type
    .refine(file => file instanceof File, { message: 'Please upload a logo' }),
  will_use_portal: z.union([z.literal('yes'), z.literal('no')]).or(z.undefined()),
  activated: z.boolean().default(true),
})
