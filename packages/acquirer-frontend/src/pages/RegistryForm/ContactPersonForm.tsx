import { useEffect } from 'react'
import { Box, Checkbox, Heading, Stack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { type ContactPerson, contactPersonSchema } from '@/lib/validations/registry'
import { CustomButton } from '@/components/ui'
import { FormInput } from '@/components/form'
import GridShell from './GridShell'

interface ContactPersonProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const ContactPersonForm = ({ setActiveStep }: ContactPersonProps) => {
  const {
    register,
    formState: { errors },
    setFocus,
    handleSubmit,
  } = useForm<ContactPerson>({
    resolver: zodResolver(contactPersonSchema),
  })

  const onSubmit = (values: ContactPerson) => {
    console.log(values)
  }

  // focus on first input that has error after validation
  useEffect(() => {
    const firstError = Object.keys(errors)[0] as keyof ContactPerson

    if (firstError) {
      setFocus(firstError)
    }
  }, [errors, setFocus])

  return (
    <Stack as='form' onSubmit={handleSubmit(onSubmit)} pt='20' noValidate>
      <GridShell>
        <Box w='20rem' justifySelf={{ md: 'center' }}>
          <Heading size='sm' as='h3'>
            Contact Person
          </Heading>

          <Checkbox mt='4'>Same as business owner</Checkbox>
        </Box>
      </GridShell>

      <GridShell pb={{ base: '8', sm: '12' }}>
        <FormInput
          isRequired
          name='name'
          register={register}
          errors={errors}
          label='Name'
          placeholder='Name'
          justifySelf='center'
        />

        <FormInput
          isRequired
          name='phoneNumber'
          register={register}
          errors={errors}
          label='Phone Number'
          placeholder='Phone Number'
          inputProps={{ type: 'number' }}
          justifySelf='center'
        />

        <FormInput
          name='email'
          register={register}
          errors={errors}
          label='Email'
          placeholder='Email'
          justifySelf='center'
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

        <CustomButton type='submit'>Review Submission</CustomButton>
      </Box>
    </Stack>
  )
}

export default ContactPersonForm
