import { PortalUserType } from 'shared-lib'

import type { AuditLogParams, AuditLogResponse, AuditLogType } from '@/types/auditLogs'
import type { PaginationParams } from '@/types/pagination'
import instance from '@/lib/axiosInstance'
import { getUserProfile } from './users'

export function transformIntoTableData(auditLogResponse: AuditLogResponse): AuditLogType {
  return {
    portalUserName: auditLogResponse?.portal_user?.name || '',
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

export async function getAuditLogs(params: AuditLogParams & PaginationParams) {
  let auditRoute = '/audits/merchant'
  const userProfile = await getUserProfile()
  if (userProfile.user_type === PortalUserType.HUB) {
    auditRoute = '/audits/hub'
  }
  const response = await instance.get<{ data: AuditLogResponse[]; totalPages: number }>(
    auditRoute,
    { params }
  )

  return {
    data: response.data.data.map(transformIntoTableData),
    totalPages: response.data.totalPages,
  }
}
