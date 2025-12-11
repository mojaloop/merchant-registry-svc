import { useEffect } from 'react'
import { Box, Stack, useToast } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { MerchantLocationType } from 'shared-lib'

import { locationInfoSchema, type LocationInfoForm } from '@/lib/validations/registry'
import {
  useCountries,
  useCreateLocationInfo,
  useDistricts,
  useDraft,
  useSubdivisions,
  useUpdateLocationInfo,
} from '@/api/hooks/forms'
import { useMerchantId } from '@/hooks'
import { CustomButton, FloatingSpinner } from '@/components/ui'
import { AddressFormFields, FormInput, FormSelect } from '@/components/form'
import GridShell from './GridShell'

export function removePropFromObj<TObj extends object, TKey extends keyof TObj>(
  obj: TObj,
  key: TKey
) {
  const filteredEntries = Object.entries(obj).filter(value => value[0] !== key)
  return Object.fromEntries(filteredEntries) as Omit<TObj, TKey>
}

const LOCATION_TYPES = Object.entries(MerchantLocationType).map(([, label]) => ({
  value: label,
  label,
}))

interface LocationInfoFormProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const LocationInfoForm = ({ setActiveStep }: LocationInfoFormProps) => {
  const toast = useToast()

  const {
    register,
    watch,
    formState: { errors },
    setValue,
    setFocus,
    handleSubmit,
  } = useForm<LocationInfoForm>({
    resolver: zodResolver(locationInfoSchema),
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

  const createLocationInfo = useCreateLocationInfo(goToNextStep)
  const updateLocationInfo = useUpdateLocationInfo(goToNextStep)

  useEffect(() => {
    if (!draftData) return

    if (!draftData.locations?.[0]) return

    const {
      location_type,
      web_url,
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
    } = draftData.locations[0]

    const checkoutCounter = draftData.checkout_counters?.[0]

    location_type && setValue('location_type', location_type)
    web_url && setValue('web_url', web_url)
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
    checkoutCounter?.description &&
      setValue('checkout_description', checkoutCounter.description)
  }, [draftData, setValue])

  const onSubmit = (values: LocationInfoForm) => {
    if (!merchantId) {
      return toast({
        title: 'Merchant ID not found!',
        status: 'error',
      })
    }

    const existingLocationId = draft.data?.locations?.[0]?.id
    if (existingLocationId) {
      const params = removePropFromObj(values, 'checkout_description')
      updateLocationInfo.mutate({
        params,
        merchantId,
        locationId: existingLocationId,
      })
    } else {
      createLocationInfo.mutate({ params: values, merchantId })
    }
  }

  // focus on first input that has error after validation
  useEffect(() => {
    const firstError = Object.keys(errors)[0] as keyof LocationInfoForm

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
        data-testid='location-info-form'
      >
        <GridShell justifyItems='center'>
          <FormSelect
            isRequired
            name='location_type'
            register={register}
            errors={errors}
            label='Location Type'
            placeholder='Location Type'
            options={LOCATION_TYPES}
          />

          <FormInput
            name='web_url'
            register={register}
            errors={errors}
            label='Website URL'
            placeholder='Website URL'
          />
        </GridShell>

        <AddressFormFields
          register={register}
          errors={errors}
          setValue={setValue}
          countryOptions={countryOptions}
          subdivisionOptions={subdivisionOptions}
          districtOptions={districtOptions}
          headingText='Physical Business Address'
        />

        <GridShell justifyItems='center' pb={{ base: '8', sm: '12' }}>
          <FormInput
            name='checkout_description'
            register={register}
            errors={errors}
            label='Checkout Counter Description'
            placeholder='Checkout Counter Description'
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

          <CustomButton
            type='submit'
            isLoading={createLocationInfo.isPending || updateLocationInfo.isPending}
          >
            Save and Proceed
          </CustomButton>
        </Box>
      </Stack>
    </>
  )
}

export default LocationInfoForm
