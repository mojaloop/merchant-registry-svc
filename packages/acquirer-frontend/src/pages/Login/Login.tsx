import { NavLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Checkbox,
  Flex,
  HStack,
  Heading,
  Image,
  Link,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { isAxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import mojaloopLogo from '@/assets/mojaloop-logo.png'
import instance from '@/lib/axiosInstance'
import { type Login, loginSchema } from '@/lib/validations/login'
import { CustomButton } from '@/components/ui'
import { FormInput } from '@/components/form'

const Login = () => {
  const navigate = useNavigate()

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<Login>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: Login) => {
    try {
      const response = await instance.post('/users/login', {
        email: values.email,
        password: values.password,
      })

      if (response.data.token) {
        alert('Login Successful')
        sessionStorage.setItem('token', response.data.token)
        navigate('/')
      }
    } catch (error) {
      if (isAxiosError(error)) {
        alert(
          error.response?.data?.error ||
            'Something went wrong! Please check your credentials and try again.'
        )
      }
    }
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
              Log In
            </CustomButton>
          </Stack>
        </Stack>
      </Flex>
    </Flex>
  )
}

export default Login
