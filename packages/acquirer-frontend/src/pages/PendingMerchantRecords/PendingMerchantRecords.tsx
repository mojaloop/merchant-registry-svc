import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
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
  approveMerchants,
  exportMerchants,
  getMerchants,
  rejectMerchants,
  revertMerchants,
} from '@/api'
import {
  REGISTRATION_STATUS_COLORS,
  type RegistrationStatus,
} from '@/constants/registrationStatus'
import { downloadMerchantsBlobAsXlsx, transformIntoTableData } from '@/utils'
import {
  AlertDialog,
  CustomButton,
  MerchantInformationModal,
  TableSkeleton,
} from '@/components/ui'
import { FormInput } from '@/components/form'
import PendingMerchantsDataTable from './PendingMerchantsDataTable'
import ReasonModal from './ReasonModal'

const PendingMerchantRecords = () => {
  const queryClient = useQueryClient()

  const [selectedMerchantId, setSelectedMerchantId] = useState<number | null>(null)
  const [selectedMerchantIds, setSelectedMerchantIds] = useState<number[]>([])

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
            isChecked={row.getIsSelected()}
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
      columnHelper.accessor('payintoAccount', {
        cell: info => info.getValue(),
        header: 'Payinto Account',
      }),
      columnHelper.accessor('merchantType', {
        cell: info => info.getValue(),
        header: 'Merchant Type',
      }),
      columnHelper.accessor('state', {
        cell: info => info.getValue(),
        header: 'State',
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
      columnHelper.accessor('registrationStatus', {
        cell: info => (
          <HStack justify='center' spacing='1.5'>
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
            mt={{ base: '2', xl: '0' }}
            mr={{ base: '-2', xl: '3' }}
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
  }, [onInfoModalOpen])

  const {
    register,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
  } = useForm<MerchantsFilterForm>({
    resolver: zodResolver(merchantsFilterSchema),
  })

  const getPendingMerchantRecords = async (values: MerchantsFilterForm) => {
    const params = { ...values, registrationStatus: MerchantRegistrationStatus.REVIEW }
    const pendingMerchants = await getMerchants(params)

    return pendingMerchants.map(transformIntoTableData)
  }

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['pending-merchants'],
    queryFn: () => getPendingMerchantRecords(getValues()),
  })

  const onSubmit = () => {
    refetch()
  }

  return (
    <Stack h='full'>
      <Heading size='md' mb='10'>
        Pending Registered Merchants
      </Heading>

      <Stack as='form' spacing='8' onSubmit={handleSubmit(onSubmit)}>
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
          <FormInput
            name='addedBy'
            register={register}
            errors={errors}
            label='Added By'
            placeholder='Enter the one who is added by'
          />

          <FormInput
            name='approvedBy'
            register={register}
            errors={errors}
            label='Approved By'
            placeholder='Enter the one who is approved by'
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
            name='payintoAccountId'
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
              refetch()
            }}
          >
            Clear Filter
          </CustomButton>

          <CustomButton type='submit' px='6'>
            Search
          </CustomButton>
        </Box>
      </Stack>

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
          onApproveAlertClose()
          await approveMerchants(selectedMerchantIds)
          refetch()
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
          await rejectMerchants(selectedMerchantIds, reason)
          refetch()
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
          await revertMerchants(selectedMerchantIds, reason)
          refetch()
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
        {isFetching && <TableSkeleton breakpoint='xl' />}

        {!isLoading && !isFetching && !isError && (
          <PendingMerchantsDataTable
            columns={columns}
            data={data}
            breakpoint='xl'
            alwaysVisibleColumns={[0, 1]}
            onExport={async () => {
              const blobData = await exportMerchants({
                ...getValues(),
                registrationStatus: MerchantRegistrationStatus.REVIEW,
              })
              if (blobData) {
                downloadMerchantsBlobAsXlsx(blobData)
              }
            }}
            onReject={selectedMerchantIds => {
              setSelectedMerchantIds(selectedMerchantIds)
              onRejectAlertOpen()
            }}
            onApprove={async selectedMerchantIds => {
              setSelectedMerchantIds(selectedMerchantIds)
              onApproveAlertOpen()
            }}
            onRevert={selectedMerchantIds => {
              setSelectedMerchantIds(selectedMerchantIds)
              onRevertAlertOpen()
            }}
          />
        )}
      </Box>
    </Stack>
  )
}

export default PendingMerchantRecords
