import { Box, HStack, Heading, Stack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { type AddNewUserForm, addNewUserSchema } from '@/lib/validations/addNewUser'
import { useCreateUser } from '@/api/hooks/users'
import { CustomButton } from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'

const ROLE_OPTIONS = [
  { label: 'Admin User', value: 'Admin User' },
  { label: 'Operator', value: 'Operator' },
  { label: 'Auditor', value: 'Auditor' },
]

const AddNewUser = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<AddNewUserForm>({
    resolver: zodResolver(addNewUserSchema),
  })

  const createUser = useCreateUser()

  const onSubmit = (values: AddNewUserForm) => {
    createUser.mutate(values)
  }

  return (
    <Box
      minH='full'
      bg='primaryBackground'
      pt='6'
      px={{ base: '4', sm: '6', md: '12', xl: '20' }}
      pb='14'
      flexGrow='1'
    >
      <Heading size='md' mb='10'>
        User Management
      </Heading>

      <Stack as='form' spacing='4' maxW='25rem' onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          name='name'
          register={register}
          errors={errors}
          label='Name'
          inputProps={{ bg: 'white' }}
          maxW='25rem'
        />

        <FormInput
          name='email'
          register={register}
          errors={errors}
          label='Name'
          inputProps={{ bg: 'white' }}
          maxW='25rem'
        />

        <FormSelect
          name='role'
          register={register}
          errors={errors}
          label='Role'
          placeholder='Choose Role'
          options={ROLE_OPTIONS}
          selectProps={{ bg: 'white' }}
          maxW='25rem'
        />

        <HStack spacing='3' alignSelf='end' mt='8'>
          <CustomButton type='submit'>Submit</CustomButton>
          <CustomButton colorVariant='accent-outline'>Cancel</CustomButton>
        </HStack>
      </Stack>
    </Box>
  )
}

export default AddNewUser
