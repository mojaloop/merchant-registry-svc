import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Link,
  Radio,
  RadioGroup,
  Select,
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

interface BusinessInfoFormProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const EMPLOYEE_COUNTS = ['1 - 10', '11 - 50', '51 - 100', '100 +']
const MERCHANT_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'small-shop', label: 'Small Shop' },
  { value: 'chain-store', label: 'Chain Store' },
]
const CURRENCIES = ['USD', 'EUR', 'MMK']

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
    handleSubmit,
  } = useForm<BusinessInfo>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: '',
      registeredName: '',
      payintoAccount: '',
      numberOfEmployee: undefined,
      monthlyTurnOver: '',
      merchantCategory: undefined,
      merchantType: null,
      registeredDFSPName: '',
      currency: null,
      haveBusinessLicense: undefined,
      licenseNumber: '',
      licenseDocument: null,
    },
  })

  const watchedLicenseDocument = watch('licenseDocument')
  const watchedHaveLicense = watch('haveBusinessLicense')
  const haveLicense = watchedHaveLicense === 'yes'

  const onSubmit = (values: BusinessInfo) => {
    console.log(values)
    setActiveStep(2)
  }

  useEffect(() => {
    if (watchedHaveLicense === 'no') {
      setValue('licenseDocument', null)
    }
  }, [watchedHaveLicense, setValue])

  return (
    <Stack as='form' onSubmit={handleSubmit(onSubmit)} pt='20'>
      <SimpleGrid
        templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        rowGap={{ base: '4', sm: '6' }}
        pb='6'
      >
        <FormControl
          isRequired
          isInvalid={!!errors.businessName}
          maxW={{ md: '20rem' }}
          justifySelf='center'
        >
          <FormLabel fontSize='sm'>Business Name</FormLabel>
          <Input {...register('businessName')} placeholder='Business Name' />
          <FormErrorMessage>{errors.businessName?.message}</FormErrorMessage>
        </FormControl>

        <FormControl
          isInvalid={!!errors.registeredName}
          maxW={{ md: '20rem' }}
          justifySelf='center'
        >
          <FormLabel fontSize='sm'>Registered Name</FormLabel>
          <Input {...register('registeredName')} placeholder='Registered Name' />
          <FormErrorMessage>{errors.registeredName?.message}</FormErrorMessage>
        </FormControl>

        <FormControl
          isInvalid={!!errors.payintoAccount}
          maxW={{ md: '20rem' }}
          justifySelf='center'
        >
          <FormLabel fontSize='sm'>Payinto Account</FormLabel>
          <Input {...register('payintoAccount')} placeholder='Payinto Account' />
          <FormErrorMessage>{errors.payintoAccount?.message}</FormErrorMessage>
        </FormControl>

        <FormControl
          isRequired
          isInvalid={!!errors.numberOfEmployee}
          maxW={{ md: '20rem' }}
          justifySelf='center'
        >
          <FormLabel fontSize='sm'>Number of Employee</FormLabel>
          <Select {...register('numberOfEmployee')} defaultValue=''>
            <option value='' disabled>
              Number of Employee
            </option>
            {EMPLOYEE_COUNTS.map(employeeCount => (
              <option key={employeeCount} value={employeeCount}>
                {employeeCount}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.numberOfEmployee?.message}</FormErrorMessage>
        </FormControl>

        <FormControl
          isInvalid={!!errors.monthlyTurnOver}
          maxW={{ md: '20rem' }}
          justifySelf='center'
        >
          <FormLabel fontSize='sm'>Monthly Turn Over</FormLabel>
          <Input {...register('monthlyTurnOver')} placeholder='Monthly Turn Over' />
          <FormErrorMessage>{errors.monthlyTurnOver?.message}</FormErrorMessage>
        </FormControl>

        <FormControl
          isRequired
          isInvalid={!!errors.merchantCategory}
          maxW={{ md: '20rem' }}
          justifySelf='center'
        >
          <FormLabel fontSize='sm'>Merchant Category</FormLabel>
          <Select {...register('merchantCategory')} defaultValue=''>
            <option value='' disabled>
              Merchant Type
            </option>
            {MERCHANT_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.merchantCategory?.message}</FormErrorMessage>
        </FormControl>

        <FormControl
          isInvalid={!!errors.merchantType}
          maxW={{ md: '20rem' }}
          justifySelf='center'
        >
          <FormLabel fontSize='sm'>Merchant Type</FormLabel>
          <Select {...register('merchantType')} defaultValue=''>
            <option value='' disabled>
              Merchant Type
            </option>
            {MERCHANT_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.merchantType?.message}</FormErrorMessage>
        </FormControl>

        <FormControl
          isInvalid={!!errors.registeredDFSPName}
          maxW={{ md: '20rem' }}
          justifySelf='center'
        >
          <FormLabel fontSize='sm'>Registered DFSP Name</FormLabel>
          <Select {...register('registeredDFSPName')} defaultValue=''>
            <option value='' disabled>
              DFSP
            </option>
            {['AA', 'BB', 'CC'].map(dfspName => (
              <option key={dfspName} value={dfspName}>
                {dfspName}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.registeredDFSPName?.message}</FormErrorMessage>
        </FormControl>

        <FormControl
          isInvalid={!!errors.currency}
          maxW={{ md: '20rem' }}
          justifySelf='center'
        >
          <FormLabel fontSize='sm'>Currency</FormLabel>
          <Select {...register('currency')} defaultValue=''>
            <option value='' disabled>
              Currency
            </option>
            {CURRENCIES.map(currency => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.currency?.message}</FormErrorMessage>
        </FormControl>
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
        <FormControl
          isDisabled={!haveLicense}
          isInvalid={!!errors.licenseNumber}
          maxW={{ md: '20rem' }}
          justifySelf='center'
        >
          <FormLabel fontSize='sm'>License Number</FormLabel>
          <Input {...register('licenseNumber')} placeholder='License Number' />
          <FormErrorMessage>{errors.licenseNumber?.message}</FormErrorMessage>
        </FormControl>

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

        <CustomButton type='submit' w='36'>
          Save and proceed
        </CustomButton>
      </Box>
    </Stack>
  )
}

export default BusinessInfoForm
