import { useEffect } from 'react'
import { Box, Checkbox, Heading, Stack, useDisclosure } from '@chakra-ui/react'
import { isAxiosError } from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormReponse } from '@/types/form'
import instance from '@/lib/axiosInstance'
import { type ContactPerson, contactPersonSchema } from '@/lib/validations/registry'
import { CustomButton, MerchantInformationModal } from '@/components/ui'
import { FormInput } from '@/components/form'
import GridShell from './GridShell'

interface ContactPersonProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const ContactPersonForm = ({ setActiveStep }: ContactPersonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    register,
    control,
    formState: { errors },
    setFocus,
    handleSubmit,
  } = useForm<ContactPerson>({
    resolver: zodResolver(contactPersonSchema),
    defaultValues: {
      is_same_as_business_owner: false,
      email: null,
    },
  })

  const onSubmit = async (values: ContactPerson) => {
    const merchantId = sessionStorage.getItem('merchantId')
    if (merchantId == null) {
      alert('Merchant ID not found. Go back to the previous page and try again')
      return
    }

    try {
      const response = await instance.post<FormReponse>(
        `/merchants/${merchantId}/contact-persons`,
        values,
        {
          headers: {
            Authorization: `Bearer test_1_dummy_auth_token`,
          },
        }
      )

      if (response.data.data?.id) {
        alert(response.data.message)
        onOpen()
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
    const firstError = Object.keys(errors)[0] as keyof ContactPerson

    if (firstError) {
      setFocus(firstError)
    }
  }, [errors, setFocus])

  return (
    <>
      <MerchantInformationModal isOpen={isOpen} onClose={onClose} />

      <Stack as='form' onSubmit={handleSubmit(onSubmit)} pt='20' noValidate>
        <GridShell>
          <Box w='20rem' justifySelf={{ md: 'center' }}>
            <Heading size='sm' as='h3'>
              Contact Person
            </Heading>

            <Controller
              control={control}
              name='is_same_as_business_owner'
              render={({ field: { value, onChange, ...field } }) => (
                <Checkbox mt='4' isChecked={value} onChange={onChange} {...field}>
                  Same as business owner
                </Checkbox>
              )}
            />
          </Box>
        </GridShell>

        <GridShell justifyItems='center' pb={{ base: '8', sm: '12' }}>
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
            name='phone_number'
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

          <CustomButton type='submit'>Save and Review Submission</CustomButton>
        </Box>
      </Stack>
    </>
  )
}

export default ContactPersonForm
