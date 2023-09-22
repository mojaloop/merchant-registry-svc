import type { AuditActionType, AuditTrasactionStatus } from 'shared-lib'

export interface AuditLogType {
  portalUserName: string
  actionType: AuditActionType
  applicationModule: string
  eventDescription: string
  entityName: string
  oldValue: string
  newValue: string
  createdAt: string
  transactionStatus: AuditTrasactionStatus
}

export interface AuditLogResponse {
  id: number
  action_type: AuditActionType
  application_module: string
  event_description: string
  entity_name: string
  old_value: string
  new_value: string
  created_at: string
  transaction_status: AuditTrasactionStatus
}
