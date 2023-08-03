import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  IconButton,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VisuallyHiddenInput,
} from '@chakra-ui/react'
import { isAxiosError } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MdFileUpload } from 'react-icons/md'
import {
  CurrencyDescriptions,
  MerchantCategoryCodes,
  NumberOfEmployees,
  MerchantType,
} from 'shared-lib'

import instance from '@/lib/axiosInstance'
import { type BusinessInfo, businessInfoSchema } from '@/lib/validations/registry'
import { CustomButton } from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'
import GridShell from './GridShell'

const EMPLOYEE_COUNTS = Object.values(NumberOfEmployees).map(value => ({
  value,
  label: value,
}))

const MERCHANT_TYPES = Object.entries(MerchantType).map(([, label]) => ({
  value: label,
  label,
}))

const MERCHANT_CATEGORY_CODES = Object.entries(MerchantCategoryCodes).map(
  ([value, label]) => ({
    value,
    label,
  })
)

const CURRENCIES = Object.entries(CurrencyDescriptions).map(([value, label]) => ({
  value,
  label: `${value} (${label})`,
}))

interface BusinessInfoFormProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const BusinessInfoForm = ({ setActiveStep }: BusinessInfoFormProps) => {
  const navigate = useNavigate()

  const licenseDocumentRef = useRef<HTMLInputElement>(null)
  const uploadFileButtonRef = useRef<HTMLButtonElement>(null)

  const {
    register,
    control,
    watch,
    formState: { errors },
    setValue,
    setFocus,
    handleSubmit,
  } = useForm<BusinessInfo>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      license_document: null,
    },
  })

  const watchedLicenseDocument = watch('license_document')
  const watchedHaveLicense = watch('have_business_license')
  const haveLicense = watchedHaveLicense === 'yes'

  const onSubmit = async (values: BusinessInfo) => {
    const formData = new FormData()

    // Loop over the form values and append each one to the form data.
    Object.entries(values).forEach(([key, value]) => {
      if (value instanceof File || typeof value === 'string') {
        formData.append(key, value)
      }
    })

    try {
      const response = await instance.post<{ data: { id: number } }>(
        '/merchants/draft',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer test_1_dummy_auth_token`,
          },
        }
      )

      if (response.data.data?.id) {
        sessionStorage.setItem('merchantId', response.data.data.id.toString())
        setActiveStep(activeStep => activeStep + 1)
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error)
        alert(
          'Error: ' + error.response?.data?.error ||
            'Something went wrong! Please check your data and try again.'
        )
      }
    }
  }

  // focus on first input that has error after validation
  useEffect(() => {
    const firstError = Object.keys(errors)[0] as keyof BusinessInfo

    if (firstError) {
      setFocus(firstError)
    }
  }, [errors, setFocus])

  useEffect(() => {
    if (watchedHaveLicense === 'no') {
      setValue('license_document', null)
    }
  }, [watchedHaveLicense, setValue])

  return (
    <Stack as='form' onSubmit={handleSubmit(onSubmit)} pt='20' noValidate>
      <GridShell justifyItems='center'>
        <FormInput
          isRequired
          name='dba_trading_name'
          register={register}
          errors={errors}
          label='Doing Business As Name'
          placeholder='Business Name'
        />

        <FormInput
          name='registered_name'
          register={register}
          errors={errors}
          label='Registered Name'
          placeholder='Registered Name'
        />

        <FormInput
          isRequired
          name='payinto_alias'
          register={register}
          errors={errors}
          label='Payinto Account'
          placeholder='Payinto Account'
        />

        <FormSelect
          isRequired
          name='employees_num'
          register={register}
          errors={errors}
          label='Number of Employee'
          placeholder='Number of Employee'
          options={EMPLOYEE_COUNTS}
          errorMsg='Please select an option'
        />

        <FormInput
          name='monthly_turnover'
          register={register}
          errors={errors}
          label='Monthly Turn Over'
          placeholder='Monthly Turn Over'
        />

        <FormSelect
          isRequired
          name='category_code'
          register={register}
          errors={errors}
          label='Merchant Category'
          placeholder='Merchant Category'
          options={MERCHANT_CATEGORY_CODES}
          errorMsg='Please select a category'
        />

        <FormSelect
          name='merchant_type'
          register={register}
          errors={errors}
          label='Merchant Type'
          placeholder='Merchant Type'
          options={MERCHANT_TYPES}
        />

        <FormSelect
          name='dfsp_name'
          register={register}
          errors={errors}
          label='Registered DFSP Name'
          placeholder='DFSP'
          options={[
            { value: 'AA', label: 'AA' },
            { value: 'BB', label: 'BB' },
            { value: 'CC', label: 'CC' },
          ]}
        />

        <FormSelect
          name='currency_code'
          register={register}
          errors={errors}
          label='Currency'
          placeholder='Currency'
          options={CURRENCIES}
          errorMsg='Please select a currency'
        />
      </GridShell>

      <GridShell justifyItems='center'>
        <FormControl maxW={{ md: '20rem' }}>
          <Text mb='4'>Do you have Business license?</Text>
          <Controller
            control={control}
            name='have_business_license'
            render={({ field }) => (
              <RadioGroup {...field} onChange={value => field.onChange(value)}>
                <Stack>
                  <Radio value='yes'>Yes</Radio>
                  <Radio value='no'>No</Radio>
                </Stack>
              </RadioGroup>
            )}
          />
        </FormControl>
      </GridShell>

      <GridShell justifyItems='center' pb={{ base: '8', sm: '12' }}>
        <FormInput
          isDisabled={!haveLicense}
          name='license_number'
          register={register}
          errors={errors}
          label='License Number'
          placeholder='License Number'
        />

        <Box w='full' maxW={{ md: '20rem' }}>
          <FormControl
            isDisabled={!haveLicense}
            isInvalid={!!errors.license_document}
            maxW={{ md: '20rem' }}
          >
            <FormLabel
              htmlFor='licenseDocument'
              fontSize='sm'
              pointerEvents={haveLicense ? undefined : 'none'}
            >
              License Document
            </FormLabel>
            <Controller
              control={control}
              name='license_document'
              render={({ field: { name, onBlur, onChange } }) => (
                <VisuallyHiddenInput
                  id='licenseDocument'
                  ref={licenseDocumentRef}
                  type='file'
                  accept='.pdf'
                  name={name}
                  onBlur={onBlur}
                  onChange={e => {
                    if (!e.target.files) return
                    onChange(e.target.files[0])
                  }}
                />
              )}
            />
            <HStack
              w='full'
              h='10'
              position='relative'
              px='4'
              rounded='md'
              border='1px'
              borderColor='gray.200'
              opacity={!haveLicense ? '0.4' : '1'}
            >
              <Text color='gray.500'>
                {watchedLicenseDocument
                  ? watchedLicenseDocument?.name
                  : 'Upload your file'}
              </Text>
              <IconButton
                ref={uploadFileButtonRef}
                aria-label='Upload file'
                icon={<MdFileUpload />}
                variant='unstyled'
                h='auto'
                minW='auto'
                position='absolute'
                top='0.45rem'
                right='2.5'
                fontSize='22px'
                color='accent'
                isDisabled={!haveLicense}
                onClick={() => {
                  licenseDocumentRef.current?.click()
                  uploadFileButtonRef.current?.focus()
                }}
              />
            </HStack>
            <FormErrorMessage>{errors.license_document?.message}</FormErrorMessage>
          </FormControl>

          {haveLicense && (
            <Box mt='4'>
              <Text mb='1.5' fontSize='sm'>
                Download sample files here.
              </Text>

              <Link
                download
                href='https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?cs=srgb&dl=pexels-pixabay-268533.jpg&fm=jpg'
                color='blue.500'
                fontSize='sm'
              >
                Sample license document template
              </Link>
            </Box>
          )}
        </Box>
      </GridShell>

      <Box alignSelf='end'>
        <CustomButton
          colorVariant='accent-outline'
          w='32'
          mr='4'
          onClick={() => navigate(-1)}
        >
          Back
        </CustomButton>

        <CustomButton type='submit'>Save and proceed</CustomButton>
      </Box>
    </Stack>
  )
}

export default BusinessInfoForm
