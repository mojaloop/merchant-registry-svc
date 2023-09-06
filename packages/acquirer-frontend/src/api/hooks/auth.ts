import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useToast } from '@chakra-ui/react'

import { login, setPassword } from '../auth'

export function useLogin() {
  const navigate = useNavigate()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => {
      return login(email, password)
    },
    onSuccess: data => {
      sessionStorage.setItem('token', data)
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
          description:
            error.response?.data.message ||
            'Something went wrong! Please try again later.',
          status: 'error',
        })
      }
    },
  })
}
