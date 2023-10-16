import { useQuery } from '@tanstack/react-query'

import type { AuditLogParams } from '@/types/auditLogs'
import type { PaginationParams } from '@/types/pagination'
import { FALLBACK_ERROR_MESSAGE } from '@/constants/errorMessage'
import { getAuditLogs } from '../auditLogs'

export function useAuditLogs(params: AuditLogParams & PaginationParams) {
  return useQuery({
    queryKey: ['audits', params],
    queryFn: () => getAuditLogs(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Audit Logs Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}
