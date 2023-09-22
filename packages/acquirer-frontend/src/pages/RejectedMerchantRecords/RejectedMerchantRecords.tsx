import { useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import {
  Box,
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
import { useExportMerchants, useRejectedMerchants } from '@/api/hooks/merchants'
import { useUsers } from '@/api/hooks/users'
import {
  REGISTRATION_STATUS_COLORS,
  type RegistrationStatus,
} from '@/constants/registrationStatus'
import { downloadMerchantsBlobAsXlsx } from '@/utils'
import {
  CustomButton,
  DataTable,
  EmptyState,
  FormSkeleton,
  MerchantInformationModal,
  TableSkeleton,
} from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'

const RejectedMerchantRecords = () => {
  const [selectedMerchantId, setSelectedMerchantId] = useState<number | null>(null)

  const {
    isOpen: isInfoModalOpen,
    onOpen: onInfoModalOpen,
    onClose: onInfoModalClose,
  } = useDisclosure()

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<MerchantInfo>()

    return [
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

  const rejectedMerchants = useRejectedMerchants(getValues())
  const exportMerchants = useExportMerchants()

  const users = useUsers()
  const userOptions = users.data?.map(({ id, name }) => ({
    value: id,
    label: name,
  }))

  const onSubmit = () => {
    rejectedMerchants.refetch()
  }

  const handleExport = async () => {
    const blobData = await exportMerchants.mutateAsync({
      ...getValues(),
      registrationStatus: MerchantRegistrationStatus.REJECTED,
    })
    if (blobData) {
      downloadMerchantsBlobAsXlsx(blobData)
    }
  }

  return (
    <Stack minH='full' px={{ base: '4', sm: '6', lg: '8' }} pt='6' pb='14'>
      <Heading size='md' mb='10'>
        Rejected Merchant Report
      </Heading>

      {users.isLoading ? (
        <FormSkeleton />
      ) : (
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
            <FormSelect
              name='addedBy'
              register={register}
              errors={errors}
              label='Added By'
              placeholder='Select Added User'
              options={userOptions || []}
            />

            <FormSelect
              name='approvedBy'
              register={register}
              errors={errors}
              label='Approved By'
              placeholder='Select Approved User'
              options={userOptions || []}
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
                rejectedMerchants.refetch()
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
        {rejectedMerchants.isFetching && (
          <TableSkeleton breakpoint='lg' mt={{ base: '3', lg: '6' }} />
        )}

        {!rejectedMerchants.isLoading &&
          !rejectedMerchants.isFetching &&
          !rejectedMerchants.isError && (
            <>
              <CustomButton
                px='6'
                mb={{ base: '6', lg: '3' }}
                isDisabled={rejectedMerchants.data.length === 0}
                onClick={handleExport}
              >
                Export
              </CustomButton>

              <DataTable
                columns={columns}
                data={rejectedMerchants.data}
                breakpoint='lg'
                alwaysVisibleColumns={[0, 1]}
              />

              {rejectedMerchants.data.length === 0 && (
                <EmptyState text='There are no rejected merchant records.' mt='10' />
              )}
            </>
          )}
      </Box>
    </Stack>
  )
}

export default RejectedMerchantRecords
