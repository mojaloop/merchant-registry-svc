import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Box, Checkbox, Heading, Stack, useDisclosure } from '@chakra-ui/react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { MerchantDetails } from '@/types/merchantDetails'
import { type ContactPersonForm, contactPersonSchema } from '@/lib/validations/registry'
import {
  createContactPersonInfo,
  getDraftData,
  getMerchant,
  updateContactPersonInfo,
} from '@/api'
import { CustomButton, FloatingSpinner } from '@/components/ui'
import { FormInput } from '@/components/form'
import ReviewModal from './ReviewModal'
import GridShell from './GridShell'

interface ContactPersonProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const ContactPersonForm = ({ setActiveStep }: ContactPersonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [merchantId, setMerchantId] = useState('')
  const [formData, setFormData] = useState<MerchantDetails | null>(null)
  const [isDraft, setIsDraft] = useState(false)
  const [contactPersonId, setContactPersonId] = useState<number | null>(null)

  const {
    register,
    control,
    watch,
    formState: { errors },
    setValue,
    setFocus,
    handleSubmit,
  } = useForm<ContactPersonForm>({
    resolver: zodResolver(contactPersonSchema),
    defaultValues: {
      is_same_as_business_owner: false,
      email: null,
    },
  })

  useEffect(() => {
    const merchantId = sessionStorage.getItem('merchantId')
    if (!merchantId) return

    setMerchantId(merchantId)
  }, [])

  const { data: draftData, isLoading } = useQuery({
    queryKey: ['merchants', merchantId],
    queryFn: () => getMerchant(Number(merchantId)),
    enabled: !!merchantId,
  })

  const watchedIsSameAsBusinessOwner = watch('is_same_as_business_owner')

  useEffect(() => {
    if (!draftData) return

    setFormData(draftData)

    const contact_person = draftData.contact_persons?.[0]
    if (!contact_person) return

    setIsDraft(!!contact_person)
    const { id, name, phone_number, email } = contact_person

    id && setContactPersonId(id)
    name && setValue('name', name)
    phone_number && setValue('phone_number', phone_number)
    email && setValue('email', email)
  }, [draftData, setValue])

  useEffect(() => {
    if (!watchedIsSameAsBusinessOwner) return

    const business_owner = formData?.business_owners?.[0]
    if (!business_owner) return

    const { name, phone_number, email } = business_owner

    name && setValue('name', name)
    phone_number && setValue('phone_number', phone_number)
    email && setValue('email', email)
  }, [watchedIsSameAsBusinessOwner, formData, setValue])

  const onSubmit = async (values: ContactPersonForm) => {
    const merchantId = sessionStorage.getItem('merchantId')
    if (merchantId === null) {
      alert('Merchant ID not found. Go back to the previous page and try again')
      return
    }

    // Server expects null instead of empty string or any other falsy value
    values.email = values.email || null

    let response
    if (!isDraft) {
      response = await createContactPersonInfo(values, merchantId)
    } else {
      if (contactPersonId) {
        response = await updateContactPersonInfo(values, merchantId, contactPersonId)
      }
    }
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
    const firstError = Object.keys(errors)[0] as keyof ContactPersonForm

    if (firstError) {
      setFocus(firstError)
    }
  }, [errors, setFocus])

  return (
    <>
      {isLoading && <FloatingSpinner />}

      {formData && <ReviewModal draftData={formData} isOpen={isOpen} onClose={onClose} />}

      <Stack as='form' onSubmit={handleSubmit(onSubmit)} noValidate>
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
