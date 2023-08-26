import { useEffect, useState } from 'react'
import { Box, Checkbox, Heading, Stack, useDisclosure, useToast } from '@chakra-ui/react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { type ContactPersonForm, contactPersonSchema } from '@/lib/validations/registry'
import {
  useCreateContactPerson,
  useDraft,
  useUpdateContactPerson,
} from '@/api/hooks/forms'
import { useMerchantId } from '@/hooks'
import { CustomButton, FloatingSpinner } from '@/components/ui'
import { FormInput } from '@/components/form'
import ReviewModal from './ReviewModal'
import GridShell from './GridShell'

interface ContactPersonProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const ContactPersonForm = ({ setActiveStep }: ContactPersonProps) => {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

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

  const merchantId = useMerchantId()

  const draft = useDraft(Number(merchantId))
  const draftData = draft.data

  const createContactPerson = useCreateContactPerson(onOpen)
  const updateContactPerson = useUpdateContactPerson(onOpen)

  const watchedIsSameAsBusinessOwner = watch('is_same_as_business_owner')

  useEffect(() => {
    if (!draftData) return

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

    const business_owner = draftData?.business_owners?.[0]
    if (!business_owner) return

    const { name, phone_number, email } = business_owner

    name && setValue('name', name)
    phone_number && setValue('phone_number', phone_number)
    email && setValue('email', email)
  }, [watchedIsSameAsBusinessOwner, draftData, setValue])

  const onSubmit = (values: ContactPersonForm) => {
    if (!merchantId) {
      return toast({
        title: 'Merchant ID not found!',
        status: 'error',
      })
    }

    // Server expects null instead of empty string or any other falsy value
    values.email = values.email || null

    if (!isDraft) {
      createContactPerson.mutate({ params: values, merchantId })
    } else {
      if (contactPersonId) {
        updateContactPerson.mutate({
          params: values,
          merchantId,
          contactPersonId,
        })
      }
    }
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
      {draft.isFetching && <FloatingSpinner />}

      {merchantId && (
        <ReviewModal merchantId={merchantId} isOpen={isOpen} onClose={onClose} />
      )}

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

          <CustomButton
            type='submit'
            isLoading={createContactPerson.isLoading || updateContactPerson.isLoading}
          >
            Review Submission
          </CustomButton>
        </Box>
      </Stack>
    </>
  )
}

export default ContactPersonForm
