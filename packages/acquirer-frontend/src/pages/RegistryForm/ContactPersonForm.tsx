import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Checkbox, Heading, Stack, useDisclosure } from '@chakra-ui/react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { DraftData } from '@/types/form'
import { type ContactPerson, contactPersonSchema } from '@/lib/validations/registry'
import { createContactPersonInfo, getDraftData } from '@/api'
import { CustomButton } from '@/components/ui'
import { FormInput } from '@/components/form'
import ReviewModal from './ReviewModal'
import GridShell from './GridShell'

interface ContactPersonProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const ContactPersonForm = ({ setActiveStep }: ContactPersonProps) => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [formData, setFormData] = useState<DraftData | null>(null)

  const {
    register,
    control,
    watch,
    formState: { errors },
    setValue,
    setFocus,
    handleSubmit,
  } = useForm<ContactPerson>({
    resolver: zodResolver(contactPersonSchema),
    defaultValues: {
      is_same_as_business_owner: false,
      email: null,
    },
  })

  const watchedIsSameAsBusinessOwner = watch('is_same_as_business_owner')

  const setInitDraftData = async () => {
    const merchantId = sessionStorage.getItem('merchantId')
    if (!merchantId) return

    const draftData = await getDraftData(merchantId)

    if (!draftData) return

    setFormData(draftData)

    const contact_person = draftData.contact_persons?.[0]
    if (!contact_person) return

    const { name, phone_number, email } = contact_person

    name && setValue('name', name)
    phone_number && setValue('phone_number', phone_number)
    email && setValue('email', email)
  }

  useEffect(() => {
    setInitDraftData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!watchedIsSameAsBusinessOwner) return

    const business_owner = formData?.business_owners?.[0]
    if (!business_owner) return

    const { name, phone_number, email } = business_owner
    name && setValue('name', name)
    phone_number && setValue('phone_number', phone_number)
    email && setValue('email', email)
  }, [watchedIsSameAsBusinessOwner, formData, setValue])

  const onSubmit = async (values: ContactPerson) => {
    const merchantId = sessionStorage.getItem('merchantId')
    if (merchantId === null) {
      alert('Merchant ID not found. Go back to the previous page and try again')
      return
    }

    const token = sessionStorage.getItem('token')
    if (token === null) {
      alert('Token not found. Try logging in again.')
      navigate('/login')
      return
    }

    // Server expects null instead of empty string or any other falsy value
    values.email = values.email || null

    const response = await createContactPersonInfo(values, merchantId)
    if (!response) return

    const draftData = await getDraftData(merchantId)
    if (draftData) {
      setFormData(draftData)
    }

    alert(response.message)
    onOpen()
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
      {formData && <ReviewModal draftData={formData} isOpen={isOpen} onClose={onClose} />}

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
