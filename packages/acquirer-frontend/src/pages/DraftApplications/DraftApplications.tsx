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

import type { MerchantInfo } from '@/types/merchants'
import {
  type MerchantsFilterForm,
  merchantsFilterSchema,
} from '@/lib/validations/merchantsFilter'
import { useDrafts } from '@/api/hooks/merchants'
import { useUsers } from '@/api/hooks/users'
import {
  REGISTRATION_STATUS_COLORS,
  type RegistrationStatus,
} from '@/constants/registrationStatus'
import {
  CustomButton,
  CustomLink,
  DataTable,
  MerchantInformationModal,
  TableSkeleton,
} from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'

const DraftApplications = () => {
  const [selectedMerchantId, setSelectedMerchantId] = useState<number | null>(null)

  const { isOpen, onOpen, onClose } = useDisclosure()

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
              onOpen()
            }}
          >
            View Details
          </CustomButton>
        ),
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'proceed',
        cell: ({ row }) => (
          <CustomLink
            to='/registry/registry-form'
            mt={{ base: '2', xl: '0' }}
            mr={{ base: '-2', xl: '3' }}
            onClick={() => {
              sessionStorage.setItem('merchantId', row.original.no.toString())
            }}
          >
            Proceed
          </CustomLink>
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
  } = useForm<MerchantsFilterForm>({
    resolver: zodResolver(merchantsFilterSchema),
  })

  const drafts = useDrafts(getValues())

  const users = useUsers()
  let userOptions

  if (!users.isLoading && !users.isFetching && !users.isError) {
    userOptions = users.data.map(({ id, name }) => ({
      value: id,
      label: name,
    }))
  }

  const onSubmit = () => {
    drafts.refetch()
  }

  return (
    <Stack minH='full' px={{ base: '4', sm: '6', lg: '8' }} pt='6' pb='14'>
      <Heading size='md' mb='10'>
        Merchant Acquiring System &gt; Draft Applications
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
          <TableSkeleton breakpoint='xl' mt={{ base: '3', xl: '6' }} />
        )}

        {!drafts.isLoading && !drafts.isFetching && !drafts.isError && (
          <DataTable
            data={drafts.data}
            columns={columns}
            breakpoint='xl'
            alwaysVisibleColumns={[0]}
          />
        )}
      </Box>
    </Stack>
  )
}

export default DraftApplications
