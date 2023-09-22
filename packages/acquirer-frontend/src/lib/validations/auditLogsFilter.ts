import { z } from 'zod'
import { AuditActionType } from 'shared-lib'

export type AuditLogsFilterForm = z.infer<typeof auditLogsFilterSchema>

export const auditLogsFilterSchema = z.object({
  actionType: z.nativeEnum(AuditActionType).or(z.literal('')),
  portalUsername: z.string(),
})
