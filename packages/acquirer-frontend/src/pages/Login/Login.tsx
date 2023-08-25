import { NavLink, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  Box,
  Checkbox,
  Flex,
  HStack,
  Heading,
  Image,
  Link,
  Spinner,
  Stack,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import mojaloopLogo from '@/assets/mojaloop-logo.png'
import { type LoginForm, loginSchema } from '@/lib/validations/login'
import { login } from '@/api'
import { CustomButton } from '@/components/ui'
import { FormInput } from '@/components/form'

const Login = () => {
  const navigate = useNavigate()
  const toast = useToast()

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const { mutate, isLoading } = useMutation({
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

  const onSubmit = async (values: LoginForm) => {
    mutate({ email: values.email, password: values.password })
  }

  return (
    <Flex w='full' h='100vh' justify='center' align='center'>
      <Flex w='90vw' maxW='900px' rounded='xl' shadow='md' overflow='hidden'>
        <VStack
          w='50%'
          py='12'
          px='10'
          display={{ base: 'none', md: 'flex' }}
          justify='space-between'
          bg='#F0F9FF'
        >
          <Image src={mojaloopLogo} w='60' />

          <Heading as='h1' color='primary' textAlign='center'>
            Merchant Registry Portal
          </Heading>

          <Box alignSelf='start' color='primary' fontSize='sm' fontWeight='medium'>
            <Text>Hotline: +xx-xxxxxxxxx</Text>
            <Text>Email: info@xxxx.com</Text>
          </Box>
        </VStack>

        <Stack
          w={{ base: '100%', md: '50%' }}
          py={{ base: '8', sm: '12' }}
          px={{ base: '6', sm: '10' }}
        >
          <Heading fontSize='2xl' mb='6'>
            Log in to your account
          </Heading>

          <Stack as='form' onSubmit={handleSubmit(onSubmit)} w='full'>
            <FormInput
              name='email'
              register={register}
              errors={errors}
              label='Email'
              placeholder='Enter email'
              maxW='full'
              mb='4'
            />

            <FormInput
              name='password'
              register={register}
              errors={errors}
              label='Password'
              placeholder='Enter password'
              inputProps={{ type: 'password' }}
              maxW='full'
            />

            <HStack justify='space-between'>
              <Checkbox size='sm'>Remember me</Checkbox>
              <Link as={NavLink} to='/forgot-password' color='primary' fontSize='sm'>
                Forgot Password?
              </Link>
            </HStack>

            <CustomButton type='submit' size='md' mt='8'>
              {isLoading ? <Spinner color='white' size='xs' /> : 'Log In'}
            </CustomButton>
          </Stack>
        </Stack>
      </Flex>
    </Flex>
  )
}

export default Login
