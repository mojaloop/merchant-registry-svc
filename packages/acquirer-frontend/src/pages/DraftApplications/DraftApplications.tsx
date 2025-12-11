import { useState } from 'react'
import { type PaginationState } from '@tanstack/react-table'
import {
  Box,
  Heading,
  SimpleGrid,
  Stack,
  useDisclosure,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import {
  merchantsFilterSchema,
  type MerchantsFilterForm,
} from '@/lib/validations/merchantsFilter'
import { useDrafts } from '@/api/hooks/merchants'
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

const DraftApplications = () => {
  const [selectedMerchantId, setSelectedMerchantId] = useState<number | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleViewDetails = (merchantId: number) => {
    setSelectedMerchantId(merchantId)
    onOpen()
  }

  const columns = useMerchantColumns({
    onViewDetails: handleViewDetails,
    includeRegisteredName: true,
    includeLEI: false,
    showProceedColumn: true,
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

  const drafts = useDrafts({
    ...getValues(),
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
    data: drafts.data?.data || [],
    columns,
    pagination,
    setPagination,
  })

  const onSubmit = () => {
    drafts.refetch()
  }

  return (
    <Stack minH='full' px={{ base: '4', sm: '6', lg: '8' }} pt='6' pb='14'>
      <Heading size='md' mb='10'>
        Merchant Acquiring System &gt; Draft Applications
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
                drafts.refetch()
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
          isOpen={isOpen}
          onClose={onClose}
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
        {drafts.isFetching && (
          <TableSkeleton breakpoint='lg' mt={{ base: '3', lg: '6' }} />
        )}

        {drafts.isSuccess && !drafts.isFetching && (
          <>
            <DataTable
              table={table}
              totalPages={drafts.data.totalPages}
              breakpoint='lg'
              alwaysVisibleColumns={[0]}
            />

            {drafts.data.data.length === 0 && (
              <EmptyState text='There are no drafts.' mt='10' />
            )}
          </>
        )}
      </Box>
    </Stack>
  )
}

export default DraftApplications
