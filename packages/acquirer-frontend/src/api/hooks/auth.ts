import { useNavigate } from 'react-router-dom'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'
import { isAxiosError } from 'axios'

import { FALLBACK_ERROR_MESSAGE } from '@/constants/errorMessage'
import {
  NAV_ITEMS,
  RESTRICTED_ROUTE_NAMES,
  useNavItems,
} from '@/contexts/NavItemsContext'
import { login, logout, setPassword } from '../auth'
import { getUserProfile } from '../users'

export function useLogin() {
  const navigate = useNavigate()
  const toast = useToast()
  const { setNavItems } = useNavItems()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => {
      return login(email, password)
    },
    onSuccess: async data => {
      localStorage.setItem('token', data)

      // Remove portal user management from sidebar if the user is operator or auditor
      const userProfile = await getUserProfile()
      if (
        userProfile.role.name === 'DFSP Operator' ||
        userProfile.role.name === 'DFSP Auditor'
      ) {
        const navItems = NAV_ITEMS.filter(
          navItem => !RESTRICTED_ROUTE_NAMES.includes(navItem.name)
        )
        setNavItems(navItems)
      } else {
        setNavItems(NAV_ITEMS)
      }

      navigate('/')
      toast({
        title: 'Login Successful!',
        status: 'success',
      })
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Login Failed!',
          description:
            error.response?.data.message ||
            'Please check your credentials and try again.',
          status: 'error',
        })
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries(['users', 'profile']);
      localStorage.removeItem('token')

      navigate('/login')
      toast({
        title: 'Logout Successful!',
        description: 'You have been logged out.',
        status: 'success',
      })
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Logout Failed!',
          description: error.response?.data.message || 'Logout Failed. Please try again.',
          status: 'error',
        })
      }
    },
  })
}

export function useSetPassword() {
  const navigate = useNavigate()
  const toast = useToast()

  return useMutation({
    mutationFn: setPassword,
    onSuccess: () => {
      navigate('/login')
      toast({
        title: 'Setting Password Successful!',
        description: 'You can now log in using the credentials.',
        status: 'success',
      })
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Setting Password Failed!',
          description: error.response?.data.message || FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}
