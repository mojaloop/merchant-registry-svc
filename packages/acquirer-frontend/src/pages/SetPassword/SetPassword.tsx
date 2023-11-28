import { useState } from 'react'
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Image,
  Stack,
  Text,
  VStack,
  type IconButtonProps,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'

import mojaloopLogo from '@/assets/mojaloop-logo.png'
import { setPasswordSchema, type SetPasswordForm } from '@/lib/validations/setPassword'
import { useSetPassword } from '@/api/hooks/auth'
import { CustomButton } from '@/components/ui'
import { FormInput } from '@/components/form'

const SetPassword = () => {
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<SetPasswordForm>({
    resolver: zodResolver(setPasswordSchema),
  })

  const setPassword = useSetPassword()

  const onSubmit = (values: SetPasswordForm) => {
    setPassword.mutate(values.newPassword)
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
            Set your password
          </Heading>

          <Stack as='form' onSubmit={handleSubmit(onSubmit)} w='full'>
            <Box position='relative'>
              <FormInput
                name='newPassword'
                register={register}
                errors={errors}
                label='New Password'
                placeholder='Enter password'
                maxW='full'
                mb='4'
                inputProps={{ type: isNewPasswordShown ? 'text' : 'password' }}
              />

              {isNewPasswordShown ? (
                <IconButton
                  aria-label='Hide password'
                  icon={<AiFillEyeInvisible />}
                  onClick={() => setIsNewPasswordShown(false)}
                  {...iconButtonProps}
                />
              ) : (
                <IconButton
                  aria-label='Show password'
                  icon={<AiFillEye />}
                  onClick={() => setIsNewPasswordShown(true)}
                  {...iconButtonProps}
                />
              )}
            </Box>

            <Box position='relative'>
              <FormInput
                name='confirmPassword'
                register={register}
                errors={errors}
                label='Confirm Password'
                placeholder='Enter password'
                inputProps={{ type: isConfirmPasswordShown ? 'text' : 'password' }}
                maxW='full'
              />

              {isConfirmPasswordShown ? (
                <IconButton
                  aria-label='Hide password'
                  icon={<AiFillEyeInvisible />}
                  onClick={() => setIsConfirmPasswordShown(false)}
                  {...iconButtonProps}
                />
              ) : (
                <IconButton
                  aria-label='Show password'
                  icon={<AiFillEye />}
                  onClick={() => setIsConfirmPasswordShown(true)}
                  {...iconButtonProps}
                />
              )}
            </Box>

            <CustomButton
              type='submit'
              size='md'
              mt='8'
              isLoading={setPassword.isLoading}
            >
              Confirm
            </CustomButton>
          </Stack>
        </Stack>
      </Flex>
    </Flex>
  )
}

export default SetPassword
