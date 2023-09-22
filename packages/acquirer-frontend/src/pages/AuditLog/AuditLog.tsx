import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Box, Flex, HStack, Heading, Stack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuditActionType } from 'shared-lib'

import type { AuditLogType } from '@/types/auditLogs'
import {
  type AuditLogsFilterForm,
  auditLogsFilterSchema,
} from '@/lib/validations/auditLogsFilter'
import { useUsers } from '@/api/hooks/users'
import { CustomButton, DataTable } from '@/components/ui'
import { FormSelect } from '@/components/form'
import FilterFormSkeleton from './FilterFormSkeleton'

const actionTypeOptions = Object.values(AuditActionType).map(actionType => ({
  value: actionType,
  label: actionType,
}))

const auditLog: AuditLogType = {
  portalUserName: 'tester 1',
  actionType: AuditActionType.ACCESS,
  applicationModule: 'getMerchants',
  eventDescription: 'User 1 with email d1superadmin1@gmail.com retrieved merchants',
  entityName: 'Merchants',
  oldValue: '',
  newValue: '',
  createdAt: '9/12/2023 9:59:17 AM',
}

const AuditLog = () => {
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<AuditLogType>()

    return [
      columnHelper.accessor('portalUserName', {
        cell: info => info.getValue(),
        header: 'Portal User Name',
      }),
      columnHelper.accessor('actionType', {
        cell: info => info.getValue(),
        header: 'Action Type',
      }),
      columnHelper.accessor('applicationModule', {
        cell: info => info.getValue(),
        header: 'Application Module',
      }),
      columnHelper.accessor('eventDescription', {
        cell: info => info.getValue(),
        header: 'Event Description',
      }),
      columnHelper.accessor('entityName', {
        cell: info => info.getValue(),
        header: 'Entity Name',
      }),
      columnHelper.accessor('oldValue', {
        cell: info => info.getValue() || '...',
        header: 'Old Value',
      }),
      columnHelper.accessor('newValue', {
        cell: info => info.getValue() || '...',
        header: 'New Value',
      }),
      columnHelper.accessor('createdAt', {
        cell: info => info.getValue(),
        header: 'Created At',
      }),
      columnHelper.display({
        id: 'view-details',
        cell: () => (
          <CustomButton mt={{ base: '2', lg: '0' }} mr={{ base: '-2', lg: '3' }}>
            View Details
          </CustomButton>
        ),
        enableSorting: false,
      }),
    ]
  }, [])

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<AuditLogsFilterForm>({
    resolver: zodResolver(auditLogsFilterSchema),
  })

  const users = useUsers()
  const userOptions = users.data?.map(user => ({ value: user.name, label: user.name }))

  const onSubmit = (values: AuditLogsFilterForm) => {
    console.log(values)
  }

  return (
    <Stack minH='full' px={{ base: '4', sm: '6', lg: '8' }} pt='6' pb='14'>
      <Heading size='md' mb='10'>
        Audit Log
      </Heading>

      {users.isLoading ? (
        <FilterFormSkeleton />
      ) : (
        <Flex
          as='form'
          flexDir={{ base: 'column', md: 'row' }}
          gap='8'
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormSelect
            name='actionType'
            register={register}
            errors={errors}
            label='Action Type'
            placeholder='Choose Action Type'
            options={actionTypeOptions}
            selectProps={{ bg: 'white' }}
            maxW={{ base: 'full', md: '20rem' }}
          />

          <FormSelect
            name='portalUsername'
            register={register}
            errors={errors}
            label='Portal User Name'
            placeholder='Choose Portal User Name'
            options={userOptions || []}
            selectProps={{ bg: 'white' }}
            maxW={{ base: 'full', md: '20rem' }}
          />

          <HStack alignSelf='end' gap='3'>
            <CustomButton colorVariant='accent-outline' mb='1' onClick={() => reset()}>
              Clear Filter
            </CustomButton>

            <CustomButton type='submit' mb='1'>
              Search
            </CustomButton>
          </HStack>
        </Flex>
      )}

      <Box
        bg='primaryBackground'
        mx={{ base: '-4', sm: '-6', lg: '-8' }}
        mt='5'
        pt='6'
        px='4'
        pb='14'
        flexGrow='1'
        mb='-14'
      >
        <DataTable
          columns={columns}
          data={new Array(10).fill(0).map(() => auditLog)}
          breakpoint='xl'
          alwaysVisibleColumns={[0]}
        />
      </Box>
    </Stack>
  )
}

export default AuditLog
