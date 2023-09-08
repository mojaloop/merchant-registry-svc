import { Box, HStack, Heading, Skeleton, Stack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { Role } from '@/types/roles'
import { type AddNewUserForm, addNewUserSchema } from '@/lib/validations/addNewUser'
import { useRoles } from '@/api/hooks/roles'
import { useCreateUser, useUserProfile } from '@/api/hooks/users'
import { CustomButton } from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'

const AddNewUser = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<AddNewUserForm>({
    resolver: zodResolver(addNewUserSchema),
  })

  const roles = useRoles()
  const createUser = useCreateUser()
  const userProfile = useUserProfile()

  let roleOptions
  if (
    !roles.isLoading &&
    !roles.isError &&
    !userProfile.isLoading &&
    !userProfile.isError
  ) {
    const createAccesses: Role[] = []
    if (userProfile.data.role.permissions.includes('Assignable Admin Roles')) {
      createAccesses.push(roles.data.data.filter(role => role.name === 'DFSP Admin')[0])
    }

    if (userProfile.data.role.permissions.includes('Assignable Operator Roles')) {
      createAccesses.push(
        roles.data.data.filter(role => role.name === 'DFSP Operator')[0]
      )
    }

    if (userProfile.data.role.permissions.includes('Assignable Auditor Roles')) {
      createAccesses.push(roles.data.data.filter(role => role.name === 'DFSP Auditor')[0])
    }

    roleOptions = createAccesses.map(({ name }) => ({ label: name, value: name }))
  }

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

      {roles.isLoading && (
        <Stack spacing='6'>
          {new Array(3).fill(0).map((_, index) => (
            <Box key={index}>
              <Skeleton h='3' maxW='10' mb='2' rounded='md' />
              <Skeleton h='10' maxW='25rem' rounded='md' />
            </Box>
          ))}
        </Stack>
      )}

      {roleOptions && (
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
            label='Email'
            inputProps={{ bg: 'white' }}
            maxW='25rem'
          />

          <FormSelect
            name='role'
            register={register}
            errors={errors}
            label='Role'
            placeholder='Choose Role'
            options={roleOptions}
            selectProps={{ bg: 'white' }}
            maxW='25rem'
          />

          <HStack spacing='3' alignSelf='end' mt='8'>
            <CustomButton type='submit' isLoading={createUser.isLoading}>
              Submit
            </CustomButton>
            <CustomButton colorVariant='accent-outline' onClick={() => reset()}>
              Cancel
            </CustomButton>
          </HStack>
        </Stack>
      )}
    </Box>
  )
}

export default AddNewUser
