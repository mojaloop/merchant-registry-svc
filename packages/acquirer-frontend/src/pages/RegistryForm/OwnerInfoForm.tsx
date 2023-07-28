import { useEffect } from 'react'
import { Box, Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { type OwnerInfo, ownerInfoSchema } from '@/lib/validations/registry'
import { CustomButton } from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'

const COUNTRIES = [
  { value: 'Afghanistan', label: 'Afghanistan' },
  { value: 'Albania', label: 'Albania' },
]

interface OwnerInfoFormProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const OwnerInfoForm = ({ setActiveStep }: OwnerInfoFormProps) => {
  const {
    register,
    formState: { errors },
    setFocus,
    handleSubmit,
  } = useForm<OwnerInfo>({
    resolver: zodResolver(ownerInfoSchema),
  })

  const onSubmit = (values: OwnerInfo) => {
    console.log(values)
    setActiveStep(activeStep => activeStep + 1)
  }

  // focus on first input that has error after validation
  useEffect(() => {
    const firstError = Object.keys(errors)[0] as keyof OwnerInfo

    if (firstError) {
      setFocus(firstError)
    }
  }, [errors, setFocus])

  return (
    <Stack as='form' onSubmit={handleSubmit(onSubmit)} pt='20' noValidate>
      <SimpleGrid
        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        rowGap={{ base: '4', sm: '6' }}
        pb={{ base: '4', sm: '6' }}
      >
        <FormInput
          isRequired
          name='name'
          register={register}
          errors={errors}
          label='Name'
          placeholder='Name'
          justifySelf='center'
        />

        <FormInput
          isRequired
          name='nationalId'
          register={register}
          errors={errors}
          label='National ID'
          placeholder='National ID'
          justifySelf='center'
        />

        <FormInput
          isRequired
          name='nationality'
          register={register}
          errors={errors}
          label='Nationality'
          placeholder='Nationality'
          justifySelf='center'
        />
      </SimpleGrid>

      <SimpleGrid
        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        rowGap={{ base: '4', sm: '6' }}
        pt='2'
        pb={{ base: '4', sm: '6' }}
      >
        <Heading size='sm' as='h3' w='20rem' justifySelf={{ md: 'center' }}>
          Physical Address
        </Heading>
      </SimpleGrid>

      <SimpleGrid
        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        rowGap={{ base: '4', sm: '6' }}
        pb={{ base: '4', sm: '6' }}
      >
        <FormInput
          name='department'
          register={register}
          errors={errors}
          label='Department'
          placeholder='Department'
          justifySelf='center'
        />

        <FormInput
          name='subDepartment'
          register={register}
          errors={errors}
          label='Sub Department'
          placeholder='Sub Department'
          justifySelf='center'
        />

        <FormInput
          name='streetName'
          register={register}
          errors={errors}
          label='Street Name'
          placeholder='Street Name'
          justifySelf='center'
        />

        <FormInput
          name='buildingNumber'
          register={register}
          errors={errors}
          label='Building Number'
          placeholder='Building Number'
          justifySelf='center'
        />

        <FormInput
          name='buildingName'
          register={register}
          errors={errors}
          label='Building Name'
          placeholder='Building Name'
          justifySelf='center'
        />

        <FormInput
          name='floorNumber'
          register={register}
          errors={errors}
          label='Floor Number'
          placeholder='Floor Number'
          justifySelf='center'
        />

        <FormInput
          name='roomNumber'
          register={register}
          errors={errors}
          label='Room Number'
          placeholder='Room Number'
          justifySelf='center'
        />

        <FormInput
          name='postBox'
          register={register}
          errors={errors}
          label='Post Box'
          placeholder='Post Box'
          justifySelf='center'
        />

        <FormInput
          name='postalCode'
          register={register}
          errors={errors}
          label='Postal Code'
          placeholder='Postal Code'
          justifySelf='center'
        />

        <FormInput
          name='township'
          register={register}
          errors={errors}
          label='Township'
          placeholder='Township'
          justifySelf='center'
        />

        <FormInput
          name='district'
          register={register}
          errors={errors}
          label='District'
          placeholder='District'
          justifySelf='center'
        />

        <FormInput
          name='countrySubdivision'
          register={register}
          errors={errors}
          label='Country Subdivision (State/Divison)'
          placeholder='Country Subdivision'
          justifySelf='center'
        />

        <FormSelect
          isRequired
          name='physicalAddressCountry'
          register={register}
          errors={errors}
          label='Country'
          placeholder='Choose Country'
          options={COUNTRIES}
          errorMsg='Please select a country'
          justifySelf='center'
        />

        <FormInput
          name='longitude'
          register={register}
          errors={errors}
          label='Longitude'
          placeholder='Longitude'
          inputProps={{ type: 'number' }}
          justifySelf='center'
        />

        <FormInput
          name='latitude'
          register={register}
          errors={errors}
          label='Latitude'
          placeholder='Latitude'
          inputProps={{ type: 'number' }}
          justifySelf='center'
        />
      </SimpleGrid>

      <SimpleGrid
        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        rowGap={{ base: '4', sm: '6' }}
        pb='12'
      >
        <FormInput
          isRequired
          name='phoneNumber'
          register={register}
          errors={errors}
          label='Phone Number'
          placeholder='Phone Number'
          inputProps={{ type: 'number' }}
          justifySelf='center'
        />

        <FormInput
          name='email'
          register={register}
          errors={errors}
          label='Email'
          placeholder='Email'
          justifySelf='center'
        />
      </SimpleGrid>

      <Box alignSelf='end'>
        <CustomButton
          ml='auto'
          colorVariant='accent-outline'
          w='32'
          mr='4'
          onClick={() => setActiveStep(activeStep => activeStep - 1)}
        >
          Back
        </CustomButton>

        <CustomButton type='submit'>Save and proceed</CustomButton>
      </Box>
    </Stack>
  )
}

export default OwnerInfoForm
