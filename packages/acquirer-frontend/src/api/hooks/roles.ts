import { useQuery } from '@tanstack/react-query'

import { getRoles } from '../roles'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Roles Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}
