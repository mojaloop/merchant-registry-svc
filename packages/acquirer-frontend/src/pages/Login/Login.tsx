import { NavLink } from 'react-router-dom'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import mojaloopLogo from '@/assets/mojaloop-logo.png'
import { type Login, loginSchema } from '@/lib/validations/login'
import { CustomButton } from '@/components/ui'
import { FormInput } from '@/components/form'

const Login = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<Login>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (values: Login) => {
    console.log(values)
  }

  return (
    <Flex w='full' h='100vh' justify='center' align='center'>
      <Flex w='90vw' maxW='900px' rounded='2xl' shadow='md' overflow='hidden'>
        <VStack w='50%' py='12' px='10' justify='space-between' bg='#F0F9FF'>
          <Image src={mojaloopLogo} w='60' />

          <Heading as='h1' color='primary' textAlign='center'>
            Merchant Registry Portal
          </Heading>

          <Box alignSelf='start' color='primary' fontSize='sm' fontWeight='medium'>
            <Text>Hotline: +xx-xxxxxxxxx</Text>
            <Text>Email: info@xxxx.com</Text>
          </Box>
        </VStack>

        <Stack w='50%' py='12' px='10'>
          <Heading fontSize='2xl' mb='6'>
            Log in to your account
          </Heading>

          <Stack as='form' onSubmit={handleSubmit(onSubmit)} w='full'>
            <FormInput
              name='username'
              register={register}
              errors={errors}
              label='Username'
              placeholder='Enter username'
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