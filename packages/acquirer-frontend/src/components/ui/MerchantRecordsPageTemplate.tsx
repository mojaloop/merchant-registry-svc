import { useState } from 'react'
import { type PaginationState } from '@tanstack/react-table'
import { Box, Heading, SimpleGrid, Stack, useDisclosure } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { type MerchantRegistrationStatus } from 'shared-lib'
import { type UseQueryResult } from '@tanstack/react-query'

import {
  merchantsFilterSchema,
  type MerchantsFilterForm,
} from '@/lib/validations/merchantsFilter'
import { downloadMerchantsBlobAsXlsx } from '@/utils'
import { useExportMerchants } from '@/api/hooks/merchants'
import { useUsers } from '@/api/hooks/users'
import { useMerchantColumns, useTable } from '@/hooks'
import {
  CustomButton,
  DataTable,
  EmptyState,
  FormSkeleton,
  MerchantInformationModal,
  TableSkeleton,
} from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'
import type { MerchantInfo } from '@/types/merchants'
import type { PaginationParams } from '@/types/pagination'

interface PaginatedMerchantsResponse {
  data: MerchantInfo[]
  totalPages: number
}

interface MerchantRecordsPageTemplateProps {
  title: string
  emptyStateText: string
  registrationStatus: MerchantRegistrationStatus
  useMerchantsHook: (params: MerchantsFilterForm & PaginationParams) => UseQueryResult<PaginatedMerchantsResponse>
  columnOptions?: {
    includeRegisteredName?: boolean
    includeLEI?: boolean
    showProceedColumn?: boolean
  }
}

const MerchantRecordsPageTemplate = ({
  title,
  emptyStateText,
  registrationStatus,
  useMerchantsHook,
  columnOptions = {
    includeRegisteredName: true,
    includeLEI: false,
  },
}: MerchantRecordsPageTemplateProps) => {
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

  const handleViewDetails = (merchantId: number) => {
    setSelectedMerchantId(merchantId)
    onInfoModalOpen()
  }

  const columns = useMerchantColumns({
    onViewDetails: handleViewDetails,
    ...columnOptions,
  })

  const {
    register,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
  } = useForm<MerchantsFilterForm>({
    resolver: zodResolver(merchantsFilterSchema),
  })

  const merchants = useMerchantsHook({
    ...getValues(),
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })
  const exportMerchants = useExportMerchants()

  const users = useUsers()
  const userOptions =
    users.data?.map(({ id, name }) => ({
      value: id,
      label: name,
    })) || []

  const table = useTable({
    data: merchants.data?.data || [],
    columns,
    pagination,
    setPagination,
  })

  const onSubmit = () => {
    merchants.refetch()
  }

  const handleExport = async () => {
    const blobData = await exportMerchants.mutateAsync({
      ...getValues(),
      registrationStatus,
    })
    if (blobData) {
      downloadMerchantsBlobAsXlsx(blobData)
    }
  }

  return (
    <Stack minH='full' px={{ base: '4', sm: '6', lg: '8' }} pt='6' pb='14'>
      <Heading size='md' mb='10'>
        {title}
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
                merchants.refetch()
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
        {merchants.isFetching && (
          <TableSkeleton breakpoint='lg' mt={{ base: '3', lg: '6' }} />
        )}

        {merchants.isSuccess && !merchants.isFetching && (
          <>
            <CustomButton
              px='6'
              mb={{ base: '6', lg: '3' }}
              isDisabled={merchants.data.data.length === 0}
              onClick={handleExport}
            >
              Export
            </CustomButton>

            <DataTable
              table={table}
              totalPages={merchants.data.totalPages}
              breakpoint='lg'
              alwaysVisibleColumns={[0, 1]}
            />

            {merchants.data.data.length === 0 && (
              <EmptyState text={emptyStateText} mt='10' />
            )}
          </>
        )}
      </Box>
    </Stack>
  )
}

export default MerchantRecordsPageTemplate
