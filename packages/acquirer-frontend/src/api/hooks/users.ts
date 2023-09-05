import { useQuery } from '@tanstack/react-query'

import { getUsers } from '../users'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Data Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}
