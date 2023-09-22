import { AuditActionType } from 'shared-lib'

export interface AuditLogType {
  portalUserName: string
  actionType: AuditActionType
  applicationModule: string
  eventDescription: string
  entityName: string
  oldValue: string
  newValue: string
  createdAt: string
}
