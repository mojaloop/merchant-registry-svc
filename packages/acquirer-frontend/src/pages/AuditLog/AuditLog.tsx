import { useMemo, useState } from 'react'
import { createColumnHelper, type PaginationState } from '@tanstack/react-table'
import { Box, Flex, Heading, HStack, Stack, useDisclosure } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useForm } from 'react-hook-form'
import { AuditActionType } from 'shared-lib'

import type { AuditLogType } from '@/types/auditLogs'
import {
  auditLogsFilterSchema,
  type AuditLogsFilterForm,
} from '@/lib/validations/auditLogsFilter'
import { useAuditLogs } from '@/api/hooks/auditLogs'
import { useUsers } from '@/api/hooks/users'
import { useTable } from '@/hooks'
import { CustomButton, DataTable, EmptyState, TableSkeleton } from '@/components/ui'
import { FormSelect } from '@/components/form'
import AuditLogDetailsModal from './AuditLogDetailsModal'
import FilterFormSkeleton from './FilterFormSkeleton'

const actionTypeOptions = Object.values(AuditActionType).map(actionType => ({
  value: actionType,
  label: actionType,
}))

const AuditLog = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogType | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

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
        cell: '...',
        header: 'Old Value',
      }),
      columnHelper.accessor('newValue', {
        cell: '...',
        header: 'New Value',
      }),
      columnHelper.accessor('transactionStatus', {
        cell: info => info.getValue(),
        header: 'Transaction Status',
      }),
      columnHelper.accessor('createdAt', {
        cell: info => dayjs(info.getValue()).format('DD/MM/YYYY hh:mm:ss A'),
        header: 'Created At',
      }),
      columnHelper.display({
        id: 'view-details',
        cell: ({ row }) => (
          <CustomButton
            mt={{ base: '2', lg: '0' }}
            mr={{ base: '-2', lg: '3' }}
            onClick={() => {
              setSelectedAuditLog(row.original)
              onOpen()
            }}
          >
            View Details
          </CustomButton>
        ),
        enableSorting: false,
      }),
    ]
  }, [onOpen])

  const {
    register,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
  } = useForm<AuditLogsFilterForm>({
    resolver: zodResolver(auditLogsFilterSchema),
  })

  const auditLogs = useAuditLogs({
    actionType: getValues('actionType'),
    portalUserId: getValues('portalUsername'),
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const users = useUsers()
  const userOptions =
    users.data?.map(({ id, name }) => ({
      value: id,
      label: name,
    })) || []

  const table = useTable({
    data: auditLogs.data?.data || [],
    columns,
    pagination,
    setPagination,
  })

  const onSubmit = () => {
    auditLogs.refetch()
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
          data-testid='filter-form'
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
            options={userOptions}
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

      {selectedAuditLog && (
        <AuditLogDetailsModal
          isOpen={isOpen}
          onClose={onClose}
          auditLog={selectedAuditLog}
        />
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
        {auditLogs.isFetching && (
          <TableSkeleton breakpoint='xl' mt={{ base: '3', xl: '4' }} />
        )}

        {auditLogs.isSuccess && !auditLogs.isFetching && (
          <>
            <DataTable
              table={table}
              totalPages={auditLogs.data.totalPages}
              breakpoint='xl'
              alwaysVisibleColumns={[0]}
            />

            {auditLogs.data.data.length === 0 && (
              <EmptyState text='There are no audit logs.' mt='10' />
            )}
          </>
        )}
      </Box>
    </Stack>
  )
}

export default AuditLog
