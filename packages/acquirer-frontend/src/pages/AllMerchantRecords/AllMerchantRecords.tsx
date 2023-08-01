import { Box, Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  type RegisteredMerchants,
  registeredMerchantsSchema,
} from '@/lib/validations/registeredMerchants'
import { FormInput, FormSelect } from '@/components/form'
import { CustomButton } from '@/components/ui'

const REGISTRATION_STATUSES = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
]

const AllMerchantRecords = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<RegisteredMerchants>({
    resolver: zodResolver(registeredMerchantsSchema),
    defaultValues: {
      registrationStatus: null,
    },
  })

  const onSubmit = (values: RegisteredMerchants) => {
    console.log(values)
  }

  return (
    <Box>
      <Heading size='md' mb='10'>
        View Registered Merchants
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
            inputProps={{ type: 'datetime-local' }}
          />

          <FormInput
            name='updatedTime'
            register={register}
            errors={errors}
            label='Updated Time'
            placeholder='Choose updated date and time'
            inputProps={{ type: 'datetime-local' }}
          />

          <FormInput
            name='dabName'
            register={register}
            errors={errors}
            label='DAB Name'
            placeholder='Enter DAB name'
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
            label='Payinto ID'
            placeholder='Enter Payinto ID'
          />

          <FormSelect
            name='registrationStatus'
            register={register}
            errors={errors}
            label='Registration Status'
            placeholder='Choose registration status'
            options={REGISTRATION_STATUSES}
          />
        </SimpleGrid>

        <Box alignSelf='end'>
          <CustomButton colorVariant='accent-outline' mr='4' onClick={() => reset()}>
            Clear Filter
          </CustomButton>

          <CustomButton type='submit'>Search</CustomButton>
        </Box>
      </Stack>
    </Box>
  )
}

export default AllMerchantRecords
