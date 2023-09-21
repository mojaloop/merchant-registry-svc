export interface AuditLogType {
  portalUserName: string
  actionType: string
  applicationModule: string
  eventDescription: string
  entityName: string
  oldValue: string
  newValue: string
  createdAt: string
}
