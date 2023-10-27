import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createColumnHelper, type PaginationState } from '@tanstack/react-table'
import {
  Box,
  Checkbox,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MerchantRegistrationStatus } from 'shared-lib'

import type { MerchantInfo } from '@/types/merchants'
import {
  type MerchantsFilterForm,
  merchantsFilterSchema,
} from '@/lib/validations/merchantsFilter'
import {
  useApproveMerchants,
  useExportMerchants,
  usePendingMerchants,
  useRejectMerchants,
  useRevertMerchants,
} from '@/api/hooks/merchants'
import { useUserProfile, useUsers } from '@/api/hooks/users'
import {
  REGISTRATION_STATUS_COLORS,
  type RegistrationStatus,
} from '@/constants/registrationStatus'
import { downloadMerchantsBlobAsXlsx } from '@/utils'
import { useTable } from '@/hooks'
import {
  AlertDialog,
  CustomButton,
  DataTable,
  EmptyState,
  FormSkeleton,
  MerchantInformationModal,
  TableSkeleton,
} from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'
import ReasonModal from './ReasonModal'

const PendingMerchantRecords = () => {
  const queryClient = useQueryClient()

  const [selectedMerchantId, setSelectedMerchantId] = useState<number | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const {
    isOpen: isInfoModalOpen,
    onOpen: onInfoModalOpen,
    onClose: onInfoModalClose,
  } = useDisclosure()

  const {
    isOpen: isRejectReasonModalOpen,
    onOpen: onRejectReasonModalOpen,
    onClose: onRejectReasonModalClose,
  } = useDisclosure()

  const {
    isOpen: isRevertReasonModalOpen,
    onOpen: onRevertReasonModalOpen,
    onClose: onRevertReasonModalClose,
  } = useDisclosure()

  const {
    isOpen: isRejectAlertOpen,
    onOpen: onRejectAlertOpen,
    onClose: onRejectAlertClose,
  } = useDisclosure()

  const {
    isOpen: isApproveAlertOpen,
    onOpen: onApproveAlertOpen,
    onClose: onApproveAlertClose,
  } = useDisclosure()

  const {
    isOpen: isRevertAlertOpen,
    onOpen: onRevertAlertOpen,
    onClose: onRevertAlertClose,
  } = useDisclosure()

  const userProfile = useUserProfile()

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<MerchantInfo>()

    return [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            isChecked={table.getIsAllPageRowsSelected()}
            onChange={e => table.toggleAllPageRowsSelected(!!e.target.checked)}
            aria-label='Select all'
            borderColor='blackAlpha.400'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            isDisabled={userProfile.data?.id === row.original.maker.id}
            // Always uncheck this when the user is the same with the maker
            isChecked={
              userProfile.data?.id === row.original.maker.id ? false : row.getIsSelected()
            }
            onChange={e => row.toggleSelected(!!e.target.checked)}
            aria-label='Select row'
            borderColor='blackAlpha.400'
          />
        ),
        enableSorting: false,
      }),
      columnHelper.accessor('no', {
        cell: info => info.getValue(),
        header: 'No',
      }),
      columnHelper.accessor('dbaName', {
        cell: info => info.getValue(),
        header: 'Doing Business As Name',
      }),
      columnHelper.accessor('registeredName', {
        cell: info => info.getValue(),
        header: 'Registered Name',
      }),
      columnHelper.accessor('payintoAccountId', {
        cell: info => info.getValue(),
        header: 'Payinto Account ID',
      }),
      columnHelper.accessor('merchantType', {
        cell: info => info.getValue(),
        header: 'Merchant Type',
      }),
      columnHelper.accessor('town', {
        cell: info => info.getValue(),
        header: 'Town',
      }),
      columnHelper.accessor('countrySubdivision', {
        cell: info => info.getValue(),
        header: 'Country Subdivision',
      }),
      columnHelper.accessor('counterDescription', {
        cell: info => info.getValue(),
        header: 'Counter Description',
      }),
      columnHelper.accessor('registeredDfspName', {
        cell: info => info.getValue(),
        header: 'Registered DFSP Name',
      }),
      columnHelper.accessor('maker.name', {
        cell: info => info.getValue(),
        header: 'Maker Username',
      }),
      columnHelper.accessor('registrationStatus', {
        cell: info => (
          <HStack justify='center' spacing='1'>
            <Box
              as='span'
              minW='2'
              w='2'
              h='2'
              borderRadius='full'
              bg={REGISTRATION_STATUS_COLORS[info.getValue() as RegistrationStatus]}
            />

            <Text>{info.getValue()}</Text>
          </HStack>
        ),
        header: 'Registration Status',
      }),
      columnHelper.display({
        id: 'view-details',
        cell: ({ row }) => (
          <CustomButton
            mt={{ base: '2', lg: '0' }}
            mr={{ base: '-2', lg: '3' }}
            onClick={() => {
              setSelectedMerchantId(row.original.no)
              onInfoModalOpen()
            }}
          >
            View Details
          </CustomButton>
        ),
        enableSorting: false,
      }),
    ]
  }, [onInfoModalOpen, userProfile.data?.id])

  const {
    register,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
  } = useForm<MerchantsFilterForm>({
    resolver: zodResolver(merchantsFilterSchema),
  })

  const pendingMerchants = usePendingMerchants({
    ...getValues(),
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })
  const exportMerchants = useExportMerchants()
  const approveMerchants = useApproveMerchants()
  const rejectMerchants = useRejectMerchants()
  const revertMerchants = useRevertMerchants()

  const users = useUsers()
  const userOptions =
    users.data?.map(({ id, name }) => ({
      value: id,
      label: name,
    })) || []

  const table = useTable({
    data: pendingMerchants.data?.data || [],
    columns,
    pagination,
    setPagination,
  })

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map(row => row.original)
    // Filter merchant records that are made by the user
    .filter(merchant => merchant.maker.id !== userProfile.data?.id)

  const selectedMerchantIds = selectedRows.map(row => row.no)

  const isActionDisabled =
    (!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()) ||
    selectedRows.length === 0

  const onSubmit = () => {
    pendingMerchants.refetch()
  }

  return (
    <Stack minH='full' px={{ base: '4', sm: '6', lg: '8' }} pt='6' pb='14'>
      <Heading size='md' mb='10'>
        Pending Registered Merchants
      </Heading>

      {users.isLoading ? (
        <FormSkeleton />
      ) : (
        <Stack
          as='form'
          spacing='8'
          onSubmit={handleSubmit(onSubmit)}
          data-testid='filter-form'
        >
          <SimpleGrid
            templateColumns={{
              base: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(4, 1fr)',
            }}
            columnGap='8'
            rowGap={{ base: '4', sm: '6' }}
            justifyItems='center'
          >
            <FormSelect
              name='addedBy'
              register={register}
              errors={errors}
              label='Added By'
              placeholder='Select Added User'
              options={userOptions}
            />

            <FormSelect
              name='approvedBy'
              register={register}
              errors={errors}
              label='Approved By'
              placeholder='Select Approved User'
              options={userOptions}
            />

            <FormInput
              name='addedTime'
              register={register}
              errors={errors}
              label='Added Time'
              placeholder='Choose added date and time'
              inputProps={{ type: 'date' }}
            />

            <FormInput
              name='updatedTime'
              register={register}
              errors={errors}
              label='Updated Time'
              placeholder='Choose updated date and time'
              inputProps={{ type: 'date' }}
            />

            <FormInput
              name='dbaName'
              register={register}
              errors={errors}
              label='DBA Name'
              placeholder='Enter DBA name'
            />

            <FormInput
              name='merchantId'
              register={register}
              errors={errors}
              label='Merchant ID'
              placeholder='Enter Merchant ID'
            />

            <FormInput
              name='payintoId'
              register={register}
              errors={errors}
              label='Payinto Account ID'
              placeholder='Enter Payinto Account ID'
            />
          </SimpleGrid>

          <Box alignSelf='end'>
            <CustomButton
              colorVariant='accent-outline'
              mr='4'
              onClick={() => {
                reset()
                pendingMerchants.refetch()
              }}
            >
              Clear Filter
            </CustomButton>

            <CustomButton type='submit' px='6'>
              Search
            </CustomButton>
          </Box>
        </Stack>
      )}

      {selectedMerchantId && (
        <MerchantInformationModal
          isOpen={isInfoModalOpen}
          onClose={onInfoModalClose}
          selectedMerchantId={selectedMerchantId}
        />
      )}

      <AlertDialog
        isOpen={isRejectAlertOpen}
        onClose={onRejectAlertClose}
        onConfirm={() => {
          onRejectAlertClose()
          onRejectReasonModalOpen()
        }}
        alertText='Are you sure you want to reject these merchant records?'
      />

      <AlertDialog
        isOpen={isApproveAlertOpen}
        onClose={onApproveAlertClose}
        onConfirm={async () => {
          table.setRowSelection({})
          onApproveAlertClose()
          await approveMerchants.mutateAsync(selectedMerchantIds)
          pendingMerchants.refetch()
          queryClient.invalidateQueries(['approved-merchants'])
          queryClient.invalidateQueries(['all-merchants'])
        }}
        alertText='Are you sure you want to approve these merchant records?'
      />

      <AlertDialog
        isOpen={isRevertAlertOpen}
        onClose={onRevertAlertClose}
        onConfirm={async () => {
          onRevertAlertClose()
          onRevertReasonModalOpen()
        }}
        alertText='Are you sure you want to revert these merchant records?'
      />

      <ReasonModal
        isOpen={isRejectReasonModalOpen}
        onClose={onRejectReasonModalClose}
        title='Rejecting Merchant Records'
        inputLabel='Enter the rejecting reason'
        onConfirm={async reason => {
          table.setRowSelection({})
          await rejectMerchants.mutateAsync({ selectedMerchantIds, reason })
          pendingMerchants.refetch()
          queryClient.invalidateQueries(['rejected-merchants'])
          queryClient.invalidateQueries(['all-merchants'])
        }}
      />

      <ReasonModal
        isOpen={isRevertReasonModalOpen}
        onClose={onRevertReasonModalClose}
        title='Reverting Merchant Records'
        inputLabel='Enter the reverting reason'
        onConfirm={async reason => {
          table.setRowSelection({})
          await revertMerchants.mutateAsync({ selectedMerchantIds, reason })
          pendingMerchants.refetch()
          queryClient.invalidateQueries(['reverted-merchants'])
          queryClient.invalidateQueries(['all-merchants'])
        }}
      />

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
        {pendingMerchants.isFetching && (
          <TableSkeleton breakpoint='lg' mt={{ base: '3', lg: '6' }} />
        )}

        {pendingMerchants.isSuccess && !pendingMerchants.isFetching && (
          <>
            <HStack spacing='3' mb={{ base: '2', xl: '0' }}>
              <CustomButton
                px='6'
                mb='4'
                isDisabled={pendingMerchants.data.data.length === 0}
                onClick={async () => {
                  const blobData = await exportMerchants.mutateAsync({
                    ...getValues(),
                    registrationStatus: MerchantRegistrationStatus.REVIEW,
                  })
                  if (blobData) {
                    downloadMerchantsBlobAsXlsx(blobData)
                  }
                }}
              >
                Export
              </CustomButton>

              <CustomButton
                px='6'
                mb='4'
                isDisabled={isActionDisabled}
                onClick={() => {
                  onRejectAlertOpen()
                }}
              >
                Reject
              </CustomButton>

              <CustomButton
                px='6'
                mb='4'
                isDisabled={isActionDisabled}
                onClick={() => {
                  onApproveAlertOpen()
                }}
              >
                Approve
              </CustomButton>

              <CustomButton
                px='6'
                mb='4'
                isDisabled={isActionDisabled}
                onClick={() => {
                  onRevertAlertOpen()
                }}
              >
                Revert
              </CustomButton>
            </HStack>

            <DataTable
              table={table}
              totalPages={pendingMerchants.data.totalPages}
              breakpoint='lg'
              alwaysVisibleColumns={[0, 1]}
            />

            {pendingMerchants.data.data.length === 0 && (
              <EmptyState text='There are no pending merchant records.' mt='10' />
            )}
          </>
        )}
      </Box>
    </Stack>
  )
}

export default PendingMerchantRecords
