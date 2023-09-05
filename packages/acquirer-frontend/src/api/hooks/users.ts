import { useMutation, useQuery } from '@tanstack/react-query'

import { createUser, getUsers } from '../users'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Users Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function useCreateUser() {
  return useMutation({
    mutationFn: createUser,
  })
}
