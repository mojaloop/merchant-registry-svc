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

export interface PortalUser {
  id: number
  name: string
  email: string
  phone_number: string
}

export interface AuditLogResponse {
  id: number
  portal_user: PortalUser
  action_type: AuditActionType
  application_module: string
  event_description: string
  entity_name: string
  old_value: string
  new_value: string
  created_at: string
  transaction_status: AuditTrasactionStatus
}

export interface AuditLogParams {
  actionType: AuditActionType | ''
  portalUserId: string
}
