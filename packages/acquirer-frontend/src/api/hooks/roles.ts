import { useQuery } from '@tanstack/react-query'

import { FALLBACK_ERROR_MESSAGE } from '@/constants/errorMessage'
import { getRoles } from '../roles'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Roles Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}
