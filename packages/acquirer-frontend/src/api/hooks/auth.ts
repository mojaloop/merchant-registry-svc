import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'
import { isAxiosError } from 'axios'
import ReCAPTCHA from 'react-google-recaptcha'
import { PortalUserType } from 'shared-lib'

import { FALLBACK_ERROR_MESSAGE } from '@/constants/errorMessage'
import { NAV_ITEMS, useNavItems } from '@/contexts/NavItemsContext'
import { forgotPassword, login, logout, setPassword } from '../auth'
import { getUserProfile } from '../users'

export function useLogin(recaptchaRef: React.RefObject<ReCAPTCHA>) {
  const navigate = useNavigate()
  const toast = useToast()
  const { setNavItems } = useNavItems()

  return useMutation({
    mutationFn: ({
      email,
      password,
      recaptchaToken,
    }: {
      email: string
      password: string
      recaptchaToken: string | null
    }) => {
      return login(email, password, recaptchaToken)
    },
    onSuccess: async data => {
      localStorage.setItem('token', data)

      const userProfile = await getUserProfile()
      // Remove navigation item from sidebar if the user doesn't have the required permissions
      const userPermissions = userProfile?.role?.permissions || []

      const filteredNavItems = NAV_ITEMS.map(navItem => {
        // Copy the navItem to avoid mutating the original
        const newItem = { ...navItem }

        if (newItem.subNavItems) {
          // remove subNavItems that user lacks permissions for
          newItem.subNavItems = newItem.subNavItems.filter(subNavItem => {
            return subNavItem.permissions
              ? subNavItem.permissions.some(permission =>
                  userPermissions.includes(permission)
                )
              : true
          })
        }

        // Check the main navItem
        if (
          newItem.permissions &&
          !newItem.permissions.some(permission => userPermissions.includes(permission))
        ) {
          return null // Exclude the main navItem if user lacks permissions
        }

        return newItem
      }).filter(item => item !== null) // Remove null items

      setNavItems(filteredNavItems as typeof NAV_ITEMS)

      if (userProfile?.user_type === PortalUserType.HUB) {
        navigate('/portal-user-management/user-management')
      } else {
        navigate('/')
      }

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
      // Reset reCAPTCHA
      if (recaptchaRef.current) {
        recaptchaRef.current.reset()
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
      queryClient.clear()
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
        queryClient.invalidateQueries({ queryKey: ['users', 'profile'] })
        localStorage.removeItem('token')
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

export function useForgotPassword() {
  const toast = useToast()

  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast({
        title: 'Reset Password Link Sent!',
        description: 'You will receive an email with a link to reset your password.',
        status: 'success',
      })
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Sending Reset Password Link Failed!',
          description: error.response?.data.message || FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}
