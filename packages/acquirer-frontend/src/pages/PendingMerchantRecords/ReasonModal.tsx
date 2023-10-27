import {
  Box,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { type ReasonForm, reasonSchema } from '@/lib/validations/reason'
import { CustomButton } from '@/components/ui'
import { FormTextarea } from '@/components/form'

interface ReasonModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  inputLabel: string
  onConfirm: (reason: string) => void
}

const ReasonModal = ({
  isOpen,
  onClose,
  title,
  inputLabel,
  onConfirm,
}: ReasonModalProps) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ReasonForm>({
    resolver: zodResolver(reasonSchema),
  })

  const onSubmit = (values: ReasonForm) => {
    onConfirm(values.reason)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='inside'>
      <ModalOverlay bg='hsl(0, 0%, 100%, 0.6)' backdropFilter='blur(4px)' />

      <ModalContent w='90vw' maxW='500px' mt='20vh'>
        <ModalHeader py='3' borderBottom='1px' borderColor='gray.100'>
          <Heading as='h3' size='md'>
            {title}
          </Heading>
        </ModalHeader>
        <ModalCloseButton top='2.5' right='4' />

        <ModalBody py='5' px={{ base: '4', md: '6' }}>
          <Box
            as='form'
            onSubmit={handleSubmit(onSubmit)}
            display='flex'
            flexDir='column'
          >
            <FormTextarea
              name='reason'
              register={register}
              errors={errors}
              label={inputLabel}
              placeholder='Enter reason'
              w='full'
              maxW='full'
              textareaProps={{ minH: '36' }}
            />

            <CustomButton type='submit' colorVariant='success' alignSelf='end' mt='6'>
              Submit
            </CustomButton>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ReasonModal
