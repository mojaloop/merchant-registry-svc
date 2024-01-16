import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { Box, Heading, HStack, Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import type { Role } from '@/types/roles'
import { addNewUserSchema, type AddNewUserForm } from '@/lib/validations/addNewUser'
import { useRoles } from '@/api/hooks/roles'
import { useDfsps } from '@/api/hooks/dfsps'
import { useCreateUser, useUserProfile } from '@/api/hooks/users'
import { CustomButton, Skeleton } from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'
import { PortalUserType } from 'shared-lib';

const AddNewUser = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<AddNewUserForm>({
    resolver: zodResolver(addNewUserSchema),
  })

  const [showDfspDropdown, setShowDfspDropdown] = useState(false);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'role' && userProfile.data?.user_type === PortalUserType.HUB)  {
        setShowDfspDropdown(
          ['DFSP Admin', 'DFSP Operator', 'DFSP Auditor'].includes(value.role ?? '')
        );
      }
    });

    return () => subscription.unsubscribe();
  });

  const navigate = useNavigate()

  const roles = useRoles()
  const dfsps = useDfsps({limit: 100, page: 1})
  const createUser = useCreateUser()
  const userProfile = useUserProfile()

  let roleOptions
  if (roles.isSuccess && userProfile.isSuccess) {
    const createAccesses: Role[] = []

    if (userProfile.data.role.permissions.includes('Create Hub Admin')) {
      createAccesses.push(roles.data.data.filter(role => role.name === 'Hub Admin')[0])
    }

    if (userProfile.data.role.permissions.includes('Create DFSP Admin')) {
      createAccesses.push(roles.data.data.filter(role => role.name === 'DFSP Admin')[0])
    }

    if (userProfile.data.role.permissions.includes('Create DFSP Operator')) {
      createAccesses.push(
        roles.data.data.filter(role => role.name === 'DFSP Operator')[0]
      )
    }

    if (userProfile.data.role.permissions.includes('Create DFSP Auditor')) {
      createAccesses.push(roles.data.data.filter(role => role.name === 'DFSP Auditor')[0])
    }

    roleOptions = createAccesses.map(({ name }) => ({ label: name, value: name }))
  }

  const onSubmit = async (values: AddNewUserForm) => {
    await createUser.mutateAsync(values)
    reset()
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

          {showDfspDropdown && dfsps.isSuccess && (
            <FormSelect
              name='dfsp_id'
              register={register}
              errors={errors}
              label='DFSP'
              placeholder='Choose DFSP'
              options={dfsps.data.data.map(({ dfspName, no }) => ({ label: dfspName, value: no }))}
              selectProps={{ bg: 'white' }}
              maxW='25rem'
            />
          )}

          <HStack spacing='3' alignSelf='end' mt='8'>
            <CustomButton type='submit' isLoading={createUser.isPending}>
              Submit
            </CustomButton>
            <CustomButton
              colorVariant='accent-outline'
              onClick={() => {
                reset()
                navigate(-1)
              }}
            >
              Cancel
            </CustomButton>
          </HStack>
        </Stack>
      )}
    </Box>
  )
}

export default AddNewUser
