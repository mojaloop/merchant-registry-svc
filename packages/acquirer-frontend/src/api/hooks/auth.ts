import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'

import { login } from '../auth'

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
    onError: () => {
      toast({
        title: 'Login Failed!',
        description: 'Please check your credentials and try again.',
        status: 'error',
      })
    },
  })
}
