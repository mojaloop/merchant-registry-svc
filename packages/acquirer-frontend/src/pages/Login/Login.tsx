import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Link,
  Stack,
  Text,
  VStack,
  type IconButtonProps,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'

import mojaloopLogo from '@/assets/mojaloop-logo.png'
import { loginSchema, type LoginForm } from '@/lib/validations/login'
import { useLogin } from '@/api/hooks/auth'
import { CustomButton } from '@/components/ui'
import { FormInput } from '@/components/form'

const Login = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const login = useLogin()

  const onSubmit = (values: LoginForm) => {
    login.mutate({ email: values.email, password: values.password })
  }

  const iconButtonProps: Omit<IconButtonProps, 'icon' | 'aria-label'> = {
    size: 'lg',
    position: 'absolute',
    top: '2.35rem',
    right: '3',
    minW: 'auto',
    h: 'auto',
    p: '0.5',
    color: 'blackAlpha.800',
    bg: 'transparent !important',
    zIndex: 'docked',
    _hover: { color: 'blackAlpha.600' },
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
            Merchant Acquiring System Portal
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

          <Stack
            as='form'
            onSubmit={handleSubmit(onSubmit)}
            w='full'
            data-testid='login-form'
          >
            <FormInput
              name='email'
              register={register}
              errors={errors}
              label='Email'
              placeholder='Enter email'
              maxW='full'
              mb='4'
            />

            <Box position='relative'>
              <FormInput
                name='password'
                register={register}
                errors={errors}
                label='Password'
                placeholder='Enter password'
                inputProps={{ type: isPasswordShown ? 'text' : 'password' }}
                maxW='full'
              />

              {isPasswordShown ? (
                <IconButton
                  aria-label='Hide password'
                  icon={<AiFillEyeInvisible />}
                  onClick={() => setIsPasswordShown(false)}
                  {...iconButtonProps}
                />
              ) : (
                <IconButton
                  aria-label='Show password'
                  icon={<AiFillEye />}
                  onClick={() => setIsPasswordShown(true)}
                  {...iconButtonProps}
                />
              )}
            </Box>

            <HStack justify='end'>
              {/* <Checkbox size='sm'>Remember me</Checkbox> */}
              <Link as={NavLink} to='/forgot-password' color='primary' fontSize='sm'>
                Forgot Password?
              </Link>
            </HStack>

            <CustomButton type='submit' size='md' mt='8' isLoading={login.isPending}>
              Log In
            </CustomButton>
          </Stack>
        </Stack>
      </Flex>
    </Flex>
  )
}

export default Login
