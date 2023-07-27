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
  SimpleGrid,
  Stack,
  Text,
  VisuallyHiddenInput,
} from '@chakra-ui/react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MdFileUpload } from 'react-icons/md'

import { type BusinessInfo, businessInfoSchema } from '@/lib/validations/registry'
import { CustomButton } from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'

interface BusinessInfoFormProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const EMPLOYEE_COUNTS = [
  { value: '1 - 10', label: '1 - 10' },
  { value: '11 - 50', label: '11 - 50' },
  { value: '51 - 100', label: '51 - 100' },
  { value: '100 +', label: '100 +' },
]
const MERCHANT_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'small-shop', label: 'Small Shop' },
  { value: 'chain-store', label: 'Chain Store' },
]
const CURRENCIES = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'MMK', label: 'MMK' },
]

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
      merchantType: null,
      currency: null,
      licenseDocument: null,
    },
  })

  const watchedLicenseDocument = watch('licenseDocument')
  const watchedHaveLicense = watch('haveBusinessLicense')
  const haveLicense = watchedHaveLicense === 'yes'

  const onSubmit = (values: BusinessInfo) => {
    console.log(values)
    setActiveStep(activeStep => activeStep + 1)
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
      setValue('licenseDocument', null)
    }
  }, [watchedHaveLicense, setValue])

  return (
    <Stack as='form' onSubmit={handleSubmit(onSubmit)} pt='20' noValidate>
      <SimpleGrid
        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        rowGap={{ base: '4', sm: '6' }}
        pb='6'
      >
        <FormInput
          isRequired
          name='businessName'
          register={register}
          errors={errors}
          label='Business Name'
          placeholder='Business Name'
          justifySelf='center'
        />

        <FormInput
          name='registeredName'
          register={register}
          errors={errors}
          label='Registered Name'
          placeholder='Registered Name'
          justifySelf='center'
        />

        <FormInput
          name='payintoAccount'
          register={register}
          errors={errors}
          label='Payinto Account'
          placeholder='Payinto Account'
          justifySelf='center'
        />

        <FormSelect
          isRequired
          name='numberOfEmployee'
          register={register}
          errors={errors}
          label='Number of Employee'
          placeholder='Number of Employee'
          options={EMPLOYEE_COUNTS}
          errorMsg='Please select an option'
          justifySelf='center'
        />

        <FormInput
          name='monthlyTurnOver'
          register={register}
          errors={errors}
          label='Monthly Turn Over'
          placeholder='Monthly Turn Over'
          justifySelf='center'
        />

        <FormSelect
          isRequired
          name='merchantCategory'
          register={register}
          errors={errors}
          label='Merchant Category'
          placeholder='Merchant Type'
          options={MERCHANT_TYPES}
          errorMsg='Please select a category'
          justifySelf='center'
        />

        <FormSelect
          name='merchantType'
          register={register}
          errors={errors}
          label='Merchant Type'
          placeholder='Merchant Type'
          options={MERCHANT_TYPES}
          justifySelf='center'
        />

        <FormSelect
          name='registeredDFSPName'
          register={register}
          errors={errors}
          label='Registered DFSP Name'
          placeholder='DFSP'
          options={[
            { value: 'AA', label: 'AA' },
            { value: 'BB', label: 'BB' },
            { value: 'CC', label: 'CC' },
          ]}
          justifySelf='center'
        />

        <FormSelect
          name='currency'
          register={register}
          errors={errors}
          label='Currency'
          placeholder='Currency'
          options={CURRENCIES}
          justifySelf='center'
        />
      </SimpleGrid>

      <SimpleGrid
        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        rowGap={{ base: '4', sm: '6' }}
        pb='6'
      >
        <FormControl maxW={{ md: '20rem' }} justifySelf='center'>
          <Text mb='4'>Do you have Business license?</Text>
          <Controller
            control={control}
            name='haveBusinessLicense'
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
      </SimpleGrid>

      <SimpleGrid
        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        rowGap={{ base: '4', sm: '6' }}
        pb='12'
      >
        <FormInput
          isDisabled={!haveLicense}
          name='licenseNumber'
          register={register}
          errors={errors}
          label='License Number'
          placeholder='License Number'
          justifySelf='center'
        />

        <Box justifySelf='center' w='full' maxW={{ md: '20rem' }}>
          <FormControl
            isDisabled={!haveLicense}
            isInvalid={!!errors.licenseDocument}
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
              name='licenseDocument'
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
            <FormErrorMessage>{errors.licenseDocument?.message}</FormErrorMessage>
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
      </SimpleGrid>

      <Box alignSelf='end'>
        <CustomButton
          ml='auto'
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
