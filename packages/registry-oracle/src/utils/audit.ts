import { type AuditTrasactionStatus, type AuditActionType } from 'shared-lib'
import { AppDataSource } from '../database/dataSource'
import { AuditEntity } from '../entity/AuditEntity'
import { type EndpointDFSPEntity } from '../entity/EndpointDFSPEntity'

export async function audit (
  actionType: AuditActionType,
  auditTrasactionStatus: AuditTrasactionStatus,
  applicationModule: string,
  eventDescription: string,
  entityName: string,
  oldValue: Record<string, any>,
  newValue: Record<string, any>,
  endpoint: EndpointDFSPEntity | null = null,
  deepObjectCompare: boolean = false
): Promise<void> {
  const auditNewValues: Record<string, any> = {}
  const auditOldValues: Record<string, any> = {}

  // Compare objects and audit only the differences
  const newKeys = Object.keys(newValue)

  for (const key of newKeys) {
    if (deepObjectCompare) {
      if (JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key])) {
        auditOldValues[key] = oldValue[key] ?? null
        auditNewValues[key] = newValue[key] ?? null
      }
    } else {
      if (oldValue[key] !== newValue[key]) {
        auditOldValues[key] = oldValue[key] ?? null
        auditNewValues[key] = newValue[key] ?? null
      }
    }
  }

  const auditNewValuesStr = JSON.stringify(auditNewValues)
  const auditOldValuesStr = JSON.stringify(auditOldValues)

  const auditObject = new AuditEntity()
  auditObject.action_type = actionType
  auditObject.transaction_status = auditTrasactionStatus
  auditObject.application_module = applicationModule
  auditObject.event_description = eventDescription
  auditObject.entity_name = entityName
  auditObject.old_value = auditOldValuesStr
  auditObject.new_value = auditNewValuesStr
  if (endpoint != null) {
    auditObject.endpoint_id = endpoint.id
  }

  await AppDataSource.getRepository(AuditEntity).save(auditObject)
}
