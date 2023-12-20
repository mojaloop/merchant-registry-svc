import { useEffect, useRef, useState } from 'react'
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
  useToast,
  VisuallyHiddenInput,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { MdFileUpload } from 'react-icons/md'
import {
  CurrencyDescriptions,
  MerchantCategoryCodes,
  MerchantType,
  NumberOfEmployees,
} from 'shared-lib'

import { businessInfoSchema, type BusinessInfoForm } from '@/lib/validations/registry'
import { useCreateBusinessInfo, useDraft, useUpdateBusinessInfo } from '@/api/hooks/forms'
import { useMerchantId } from '@/hooks'
import { CustomButton, FloatingSpinner } from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'
import FileUploadModal from './FileUploadModal'
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

const extractFileNameFromUrl = (url: string) => {
  const urlSegments = url.split('?')[0].split('/')
  const fileNameSegment = urlSegments[urlSegments.length - 1]
  const fileName = fileNameSegment.split('-')[0].replace('pdf', '')
  return `${fileName}.pdf`
}

interface BusinessInfoFormProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

interface LicenseDocument {
  name: string
  link: string
}

const BusinessInfoForm = ({ setActiveStep }: BusinessInfoFormProps) => {
  const navigate = useNavigate()
  const toast = useToast()

  const [isDraft, setIsDraft] = useState(false)
  const [licenseDocument, setLicenseDocument] = useState<LicenseDocument | null>(null)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

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
  } = useForm<BusinessInfoForm>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      license_document: null,
    },
  })

  const merchantId = useMerchantId()

  const goToNextStep = () => setActiveStep(activeStep => activeStep + 1)

  const draft = useDraft(Number(merchantId))
  const draftData = draft.data

  const createBusinessInfo = useCreateBusinessInfo(goToNextStep)
  const updateBusinessInfo = useUpdateBusinessInfo(goToNextStep)

  useEffect(() => {
    if (!draftData) return

    setIsDraft(
      draftData.registration_status === 'Draft' ||
        draftData.registration_status === 'Reverted'
    )

    const {
      dba_trading_name,
      registered_name,
      // checkout_counters,
      employees_num,
      monthly_turnover,
      category_code,
      merchant_type,
      currency_code,
      business_licenses,
    } = draftData

    // const payinto_alias = checkout_counters?.[0]?.alias_value
    const merchant_category = category_code?.category_code
    const business_license = business_licenses?.[0]

    dba_trading_name && setValue('dba_trading_name', dba_trading_name)
    registered_name && setValue('registered_name', registered_name)
    // payinto_alias && setValue('payinto_alias', payinto_alias)
    employees_num && setValue('employees_num', employees_num)
    monthly_turnover && setValue('monthly_turnover', monthly_turnover)
    merchant_category && setValue('category_code', merchant_category)
    merchant_type && setValue('merchant_type', merchant_type)
    currency_code?.iso_code && setValue('currency_code', currency_code.iso_code)
    setValue(
      'have_business_license',
      business_license?.license_number || business_license?.license_document_link
        ? 'yes'
        : 'no'
    )
    business_license?.license_number &&
      setValue('license_number', business_license.license_number)
    business_license?.license_document_link &&
      setLicenseDocument({
        link: business_license.license_document_link,
        name: extractFileNameFromUrl(business_license.license_document_link),
      })
  }, [draftData, setValue])

  const watchedLicenseDocument = watch('license_document')
  const watchedHaveLicense = watch('have_business_license')
  const haveLicense = watchedHaveLicense === 'yes'

  const onSubmit = (values: BusinessInfoForm) => {
    if (!isDraft) {
      createBusinessInfo.mutate(values)
    } else {
      if (!merchantId) {
        return toast({
          title: 'Merchant ID not found!',
          description: 'Go back to the previous page and try again.',
          status: 'error',
        })
      }
      updateBusinessInfo.mutate({ params: values, merchantId })
    }
  }

  // focus on first input that has error after validation
  useEffect(() => {
    const firstError = Object.keys(errors)[0] as keyof BusinessInfoForm

    if (firstError) {
      setFocus(firstError)
    }
  }, [errors, setFocus])

  useEffect(() => {
    if (watchedHaveLicense === 'no') {
      setValue('license_number', '')
      setValue('license_document', null)
    }
  }, [watchedHaveLicense, setValue])

  return (
    <>
      {draft.isFetching && <FloatingSpinner />}

      <Stack
        as='form'
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        data-testid='business-info-form'
      >
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

          {/* <FormInput
            isRequired
            name='payinto_alias'
            register={register}
            errors={errors}
            label='Payinto Account ID'
            placeholder='Payinto Account ID'
          /> */}

          <FormSelect
            isRequired
            name='employees_num'
            register={register}
            errors={errors}
            label='Number of Employee'
            placeholder='Number of Employee'
            options={EMPLOYEE_COUNTS}
          />

          <FormInput
            name='monthly_turnover'
            register={register}
            errors={errors}
            label='Monthly Turn Over'
            placeholder='Monthly Turn Over'
            inputProps={{ type: 'number' }}
          />

          <FormSelect
            isRequired
            name='category_code'
            register={register}
            errors={errors}
            label='Merchant Category'
            placeholder='Merchant Category'
            options={MERCHANT_CATEGORY_CODES}
          />

          <FormSelect
            isRequired
            name='merchant_type'
            register={register}
            errors={errors}
            label='Merchant Type'
            placeholder='Merchant Type'
            options={MERCHANT_TYPES}
          />

          <FormSelect
            isRequired
            name='currency_code'
            register={register}
            errors={errors}
            label='Currency'
            placeholder='Currency'
            options={CURRENCIES}
          />

          <FormInput
            name='account_number'
            register={register}
            errors={errors}
            label='Account Number'
            placeholder='Account Number'
          />
        </GridShell>

        <GridShell justifyItems='center'>
          <FormControl maxW={{ md: '20rem' }}>
            <Text mb='4' fontSize='0.9375rem'>
              Do you have Business license?
            </Text>
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
                      setIsUploading(true)
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
                    : licenseDocument?.name || 'Upload your file'}
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
                    setIsDocumentModalOpen(true)
                  }}
                />
              </HStack>
              <FormErrorMessage>{errors.license_document?.message}</FormErrorMessage>
            </FormControl>

            {licenseDocument && (
              <Text fontSize='sm' mt='3'>
                Document is already uploaded.
              </Text>
            )}

            <FileUploadModal
              isOpen={isDocumentModalOpen}
              onClose={() => setIsDocumentModalOpen(false)}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              openFileInput={() => licenseDocumentRef.current?.click()}
              setFile={(file: File) => {
                setValue('license_document', file)
              }}
            />

            {haveLicense && (
              <Box mt='2'>
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

          <CustomButton
            type='submit'
            isLoading={createBusinessInfo.isPending || updateBusinessInfo.isPending}
          >
            Save and Proceed
          </CustomButton>
        </Box>
      </Stack>
    </>
  )
}

export default BusinessInfoForm
