import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'
import { isAxiosError } from 'axios'

import { FALLBACK_ERROR_MESSAGE } from '@/constants/errorMessage'
import { createUser, getUserProfile, getUsers } from '../users'

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
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
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

export function useUserProfile() {
  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: getUserProfile,
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching User Profile Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}
