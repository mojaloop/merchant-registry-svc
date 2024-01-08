import { useNavigate } from 'react-router-dom'
import { Box, Flex, Heading, Image, Stack, Text, VStack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import mojaloopLogo from '@/assets/mojaloop-logo.png'
import {
  ForgotPasswordForm,
  forgotPasswordSchema,
} from '@/lib/validations/forgotPassword'
import { useForgotPassword } from '@/api/hooks/auth'
import { CustomButton } from '@/components/ui'
import { FormInput } from '@/components/form'

const ForgotPassword = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const navigate = useNavigate()
  const forgotPassword = useForgotPassword()

  const onSubmit = (values: ForgotPasswordForm) => {
    forgotPassword.mutate(values.email)
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
            Enter your email address to reset your password
          </Heading>

          <Stack as='form' onSubmit={handleSubmit(onSubmit)} w='full'>
            <Box position='relative'>
              <FormInput
                name='email'
                register={register}
                errors={errors}
                label='Your Email'
                placeholder='Enter your email address'
                maxW='full'
                mb='4'
                inputProps={{
                  type: 'email',
                }}
              />
            </Box>

            <CustomButton
              type='submit'
              size='md'
              mt='8'
              isLoading={forgotPassword.isPending}
              loadingText='Sending...'
              isDisabled={forgotPassword.isPending}
            >
              Send Reset Password Link
            </CustomButton>

            <CustomButton
              size='md'
              mt='2'
              variant='outline'
              onClick={() => navigate('/login')}
              colorVariant='accent-outline'
            >
              Cancel
            </CustomButton>
          </Stack>
        </Stack>
      </Flex>
    </Flex>
  )
}

export default ForgotPassword
