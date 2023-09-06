import { useMutation, useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useToast } from '@chakra-ui/react'

import { FALLBACK_ERROR_MESSAGE } from '@/constants/errorMessage'
import { createUser, getUsers } from '../users'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Users Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}

export function useCreateUser() {
  const toast = useToast()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast({
        title: 'User Creation Successful!',
        description: 'Please notify the new user to check the email.',
        status: 'success',
      })
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'User Creation Failed!',
          description: error.response?.data.message || FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}
