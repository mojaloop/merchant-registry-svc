import { useEffect } from 'react'
import { Box, Heading, Stack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { type OwnerInfo, ownerInfoSchema } from '@/lib/validations/registry'
import { CustomButton } from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'
import GridShell from './GridShell'

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
      <GridShell justifyItems='center'>
        <FormInput
          isRequired
          name='name'
          register={register}
          errors={errors}
          label='Name'
          placeholder='Name'
        />

        <FormInput
          isRequired
          name='nationalId'
          register={register}
          errors={errors}
          label='National ID'
          placeholder='National ID'
        />

        <FormInput
          isRequired
          name='nationality'
          register={register}
          errors={errors}
          label='Nationality'
          placeholder='Nationality'
        />
      </GridShell>

      <GridShell pt='2'>
        <Heading size='sm' as='h3' w='20rem' justifySelf={{ md: 'center' }}>
          Physical Address
        </Heading>
      </GridShell>

      <GridShell justifyItems='center'>
        <FormInput
          name='department'
          register={register}
          errors={errors}
          label='Department'
          placeholder='Department'
        />

        <FormInput
          name='subDepartment'
          register={register}
          errors={errors}
          label='Sub Department'
          placeholder='Sub Department'
        />

        <FormInput
          name='streetName'
          register={register}
          errors={errors}
          label='Street Name'
          placeholder='Street Name'
        />

        <FormInput
          name='buildingNumber'
          register={register}
          errors={errors}
          label='Building Number'
          placeholder='Building Number'
        />

        <FormInput
          name='buildingName'
          register={register}
          errors={errors}
          label='Building Name'
          placeholder='Building Name'
        />

        <FormInput
          name='floorNumber'
          register={register}
          errors={errors}
          label='Floor Number'
          placeholder='Floor Number'
        />

        <FormInput
          name='roomNumber'
          register={register}
          errors={errors}
          label='Room Number'
          placeholder='Room Number'
        />

        <FormInput
          name='postBox'
          register={register}
          errors={errors}
          label='Post Box'
          placeholder='Post Box'
        />

        <FormInput
          name='postalCode'
          register={register}
          errors={errors}
          label='Postal Code'
          placeholder='Postal Code'
        />

        <FormInput
          name='township'
          register={register}
          errors={errors}
          label='Township'
          placeholder='Township'
        />

        <FormInput
          name='district'
          register={register}
          errors={errors}
          label='District'
          placeholder='District'
        />

        <FormInput
          name='countrySubdivision'
          register={register}
          errors={errors}
          label='Country Subdivision (State/Divison)'
          placeholder='Country Subdivision'
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
        />

        <FormInput
          name='longitude'
          register={register}
          errors={errors}
          label='Longitude'
          placeholder='Longitude'
          inputProps={{ type: 'number' }}
        />

        <FormInput
          name='latitude'
          register={register}
          errors={errors}
          label='Latitude'
          placeholder='Latitude'
          inputProps={{ type: 'number' }}
        />
      </GridShell>

      <GridShell justifyItems='center' pb={{ base: '8', sm: '12' }}>
        <FormInput
          isRequired
          name='phoneNumber'
          register={register}
          errors={errors}
          label='Phone Number'
          placeholder='Phone Number'
          inputProps={{ type: 'number' }}
        />

        <FormInput
          name='email'
          register={register}
          errors={errors}
          label='Email'
          placeholder='Email'
        />
      </GridShell>

      <Box alignSelf='end'>
        <CustomButton
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
