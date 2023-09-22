import type { AuditLogResponse, AuditLogType } from '@/types/auditLogs'
import instance from '@/lib/axiosInstance'
import type { AuditLogsFilterForm } from '@/lib/validations/auditLogsFilter'

export function transformIntoTableData(auditLogResponse: AuditLogResponse): AuditLogType {
  return {
    portalUserName: '',
    actionType: auditLogResponse.action_type,
    applicationModule: auditLogResponse.application_module,
    eventDescription: auditLogResponse.event_description,
    entityName: auditLogResponse.entity_name,
    oldValue: auditLogResponse.old_value,
    newValue: auditLogResponse.new_value,
    createdAt: auditLogResponse.created_at,
    transactionStatus: auditLogResponse.transaction_status,
  }
}

export async function getAuditLogs(params: AuditLogsFilterForm) {
  const response = await instance.get<{ data: AuditLogResponse[] }>('/audits', { params })
  return response.data.data.map(transformIntoTableData)
}
