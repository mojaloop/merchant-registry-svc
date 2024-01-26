import { useRef, useState } from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VisuallyHiddenInput,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { MdFileUpload } from 'react-icons/md'

import { onboardDfspSchema, type onboardDfspForm } from '@/lib/validations/onboardDfsp'
import { useOnboardDfsp } from '@/api/hooks/dfsps'
import { useMojaloopDfsps } from '@/api/hooks/mojaloopDfsps'
import { CustomButton } from '@/components/ui'
import { FormInput, FormSelect } from '@/components/form'
import GridShell from './GridBox'
import LogoFileUploadModal from './LogoFileUploadModal'

const OnboardDfsp = () => {
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    setError,
  } = useForm<onboardDfspForm>({
    resolver: zodResolver(onboardDfspSchema),
  })

  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)

  const logoElementRef = useRef<HTMLInputElement>(null)
  const uploadFileButtonRef = useRef<HTMLButtonElement>(null)

  const mojaloopDfsps = useMojaloopDfsps()
  const onboardDfsp = useOnboardDfsp()

  let dfspNamesOptions
  const dfspTypesOptions = [
    { label: 'Bank and Credit Union', value: 'Bank and Credit Union' },
    { label: 'Mobile Money Operator', value: 'Mobile Money Operator' },
    { label: 'Payment Service Provider', value: 'Payment Service Provider' },
    { label: 'Electronic Money Issuer', value: 'Electronic Money Issuer' },
    { label: 'Microfinance Institution', value: 'Microfinance Institution' },
    { label: 'Other', value: 'Other' },
  ]

  if (mojaloopDfsps.isSuccess) {
    const dfspArray = Array.isArray(mojaloopDfsps.data) ? mojaloopDfsps.data : []
    dfspNamesOptions = dfspArray.map(dfsp => ({
      label: dfsp.dfsp_name,
      value: dfsp.dfsp_name,
    }))
  }

  const onSubmit = async (values: onboardDfspForm) => {
    if (!values.logo) {
      setError('logo', { type: 'manual', message: 'Please upload a logo' })
      return
    }
    await onboardDfsp.mutateAsync(values)
    reset()
  }

  return (
    <>
      {dfspNamesOptions && (
        <Stack
          as='form'
          onSubmit={handleSubmit(onSubmit)}
          minH='full'
          maxW='full'
          minW='full'
        >
          <Heading size='md' mb={4} mt={7} ml={9}>
            DFSP Onboarding
          </Heading>
          <GridShell>
            <FormInput
              name='fspId'
              register={register}
              errors={errors}
              label='DFSP ID (Participant ID)'
              placeholder='Enter DFSP ID'
            />
            <FormInput
              name='name'
              register={register}
              errors={errors}
              label='DFSP Name'
              placeholder='Enter DFSP Name'
            />

            <FormSelect
              name='dfspType'
              register={register}
              errors={errors}
              label='DFSP Type'
              placeholder='Select Dfsp type'
              options={dfspTypesOptions}
              ml={0}
              selectProps={{ bg: 'white' }}
            />

            <FormInput
              name='businessLicenseId'
              register={register}
              errors={errors}
              label='DFSP Business License ID'
              inputProps={{ bg: 'white' }}
            />

            <FormControl isInvalid={!!errors.logo} maxW={{ md: '20rem' }}>
              <FormLabel htmlFor='logo' fontSize='sm'>
                DFSP Logo
              </FormLabel>

              <Controller
                control={control}
                name='logo'
                render={({ field: { name, onBlur, onChange } }) => (
                  <VisuallyHiddenInput
                    id='logo'
                    ref={logoElementRef}
                    type='file'
                    accept='.jpg, .jpeg, .png, .pdf'
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
                opacity='1'
              >
                <Text color='gray.500'>
                  {isUploaded ? 'Logo File Successfully uploaded' : 'No file uploaded'}
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
                  onClick={() => {
                    setIsLogoModalOpen(true)
                  }}
                />
              </HStack>
              <FormErrorMessage>{errors.logo?.message?.toString()}</FormErrorMessage>
            </FormControl>

            <LogoFileUploadModal
              isOpen={isLogoModalOpen}
              onClose={() => setIsLogoModalOpen(false)}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              setIsUploaded={setIsUploaded}
              openFileInput={() => logoElementRef.current?.click()}
              setFile={(file: File) => {
                setValue('logo', file)
              }}
            />

            <FormControl>
              <Text mb='4' fontSize='0.9375rem'>
                Will this DFSP use the Mojaloop Merchant Acquiring Portal?
              </Text>
              <Controller
                control={control}
                name='will_use_portal'
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
            <HStack>
              <CustomButton type='submit' mt={40} ml={30}>
                Submit
              </CustomButton>
            </HStack>
          </GridShell>
        </Stack>
      )}
    </>
  )
}

export default OnboardDfsp
