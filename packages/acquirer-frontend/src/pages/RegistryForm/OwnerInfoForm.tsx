import { useEffect } from 'react'
import { Box, Stack, useToast } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { BusinessOwnerIDType } from 'shared-lib'

import { ownerInfoSchema, type OwnerInfoForm } from '@/lib/validations/registry'
import {
  useCountries,
  useCreateOwnerInfo,
  useDistricts,
  useDraft,
  useSubdivisions,
  useUpdateOwnerInfo,
} from '@/api/hooks/forms'
import { useMerchantId } from '@/hooks'
import { CustomButton, FloatingSpinner } from '@/components/ui'
import { AddressFormFields, FormInput, FormSelect } from '@/components/form'
import GridShell from './GridShell'

const ID_TYPES = Object.entries(BusinessOwnerIDType).map(([, label]) => ({
  value: label,
  label,
}))

interface OwnerInfoFormProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const OwnerInfoForm = ({ setActiveStep }: OwnerInfoFormProps) => {
  const toast = useToast()

  const {
    register,
    watch,
    formState: { errors },
    setValue,
    setFocus,
    handleSubmit,
  } = useForm<OwnerInfoForm>({
    resolver: zodResolver(ownerInfoSchema),
    defaultValues: {
      email: null,
    },
  })

  const watchedCountry = watch('country') || ''
  const watchedSubdivision = watch('country_subdivision') || ''

  const merchantId = useMerchantId()
  const countries = useCountries()
  const subdivisions = useSubdivisions(watchedCountry)
  const districts = useDistricts(watchedCountry, watchedSubdivision)

  const countryOptions = countries.data?.map(country => ({
    value: country,
    label: country,
  }))
  const subdivisionOptions = subdivisions.data?.map(subdivision => ({
    value: subdivision,
    label: subdivision,
  }))
  const districtOptions = districts.data?.map(district => ({
    value: district,
    label: district,
  }))

  const goToNextStep = () => setActiveStep(activeStep => activeStep + 1)

  const draft = useDraft(Number(merchantId))
  const draftData = draft.data

  const createOwnerInfo = useCreateOwnerInfo(goToNextStep)
  const updateOwnerInfo = useUpdateOwnerInfo(goToNextStep)

  useEffect(() => {
    if (!draftData) return

    if (draftData.business_owners?.[0]) {
      const { name, identificaton_type, identification_number, phone_number, email } =
        draftData.business_owners[0]

      name && setValue('name', name)
      identificaton_type && setValue('identificaton_type', identificaton_type)
      identification_number && setValue('identification_number', identification_number)
      phone_number && setValue('phone_number', phone_number)
      email && setValue('email', email)
    }

    if (draftData.business_owners?.[0]?.businessPersonLocation) {
      const {
        department,
        sub_department,
        street_name,
        building_number,
        building_name,
        floor_number,
        room_number,
        post_box,
        postal_code,
        country,
        town_name,
        district_name,
        country_subdivision,
        longitude,
        latitude,
      } = draftData.business_owners[0].businessPersonLocation

      department && setValue('department', department)
      sub_department && setValue('sub_department', sub_department)
      street_name && setValue('street_name', street_name)
      building_number && setValue('building_number', building_number)
      building_name && setValue('building_name', building_name)
      floor_number && setValue('floor_number', floor_number)
      room_number && setValue('room_number', room_number)
      post_box && setValue('post_box', post_box)
      postal_code && setValue('postal_code', postal_code)
      country && setValue('country', country)
      town_name && setValue('town_name', town_name)
      district_name && setValue('district_name', district_name)
      country_subdivision && setValue('country_subdivision', country_subdivision)
      longitude && setValue('longitude', longitude)
      latitude && setValue('latitude', latitude)
    }
  }, [draftData, setValue])

  const onSubmit = (values: OwnerInfoForm) => {
    if (!merchantId) {
      return toast({
        title: 'Merchant ID not found!',
        status: 'error',
      })
    }

    // Server expects null instead of empty string or any other falsy value
    values.email = values.email || null

    const existingOwnerId = draft.data?.business_owners?.[0]?.id
    if (existingOwnerId) {
      updateOwnerInfo.mutate({ params: values, merchantId, ownerId: existingOwnerId })
    } else {
      createOwnerInfo.mutate({ params: values, merchantId })
    }
  }

  // focus on first input that has error after validation
  useEffect(() => {
    const firstError = Object.keys(errors)[0] as keyof OwnerInfoForm

    if (firstError) {
      setFocus(firstError)
    }
  }, [errors, setFocus])

  return (
    <>
      {(draft.isFetching ||
        countries.isLoading ||
        subdivisions.isFetching ||
        districts.isFetching) && <FloatingSpinner />}

      <Stack
        as='form'
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        data-testid='owner-info-form'
      >
        <GridShell justifyItems='center'>
          <FormInput
            isRequired
            name='name'
            register={register}
            errors={errors}
            label='Name'
            placeholder='Name'
          />

          <FormSelect
            isRequired
            name='identificaton_type'
            register={register}
            errors={errors}
            label='ID Type'
            placeholder='Chosse National ID Type'
            options={ID_TYPES}
          />

          <FormInput
            isRequired
            name='identification_number'
            register={register}
            errors={errors}
            label='Identification Number'
            placeholder='Identification Number'
          />

          <FormInput
            isRequired
            name='phone_number'
            register={register}
            errors={errors}
            label='Phone Number'
            placeholder='Phone Number'
          />

          <FormInput
            name='email'
            register={register}
            errors={errors}
            label='Email'
            placeholder='Email'
          />
        </GridShell>

        <AddressFormFields
          register={register}
          errors={errors}
          setValue={setValue}
          countryOptions={countryOptions}
          subdivisionOptions={subdivisionOptions}
          districtOptions={districtOptions}
          headingText='Physical Address'
        />

        <Box alignSelf='end'>
          <CustomButton
            colorVariant='accent-outline'
            w='32'
            mr='4'
            onClick={() => setActiveStep(activeStep => activeStep - 1)}
          >
            Back
          </CustomButton>

          <CustomButton
            type='submit'
            isLoading={createOwnerInfo.isPending || updateOwnerInfo.isPending}
          >
            Save and Proceed
          </CustomButton>
        </Box>
      </Stack>
    </>
  )
}

export default OwnerInfoForm
