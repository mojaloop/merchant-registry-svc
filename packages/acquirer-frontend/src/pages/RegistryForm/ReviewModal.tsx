import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Heading,
  HStack,
  Skeleton,
} from '@chakra-ui/react'

import { useChangeStatusToReview, useDraft } from '@/api/hooks/forms'
import { CustomButton } from '@/components/ui'
import { MerchantInfo } from '@/components/ui/MerchantInformationModal'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  merchantId: string
}

const ReviewModal = ({ isOpen, onClose, merchantId }: ReviewModalProps) => {
  const draft = useDraft(Number(merchantId))

  const changeStatusToReview = useChangeStatusToReview(onClose)

  const handleSubmit = () => {
    changeStatusToReview.mutate(merchantId)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='inside'>
      <ModalOverlay bg='hsl(0, 0%, 100%, 0.6)' backdropFilter='blur(4px)' />

      <ModalContent w='90vw' maxW='1000px' mt='14' mb={{ base: '14', lg: '0' }}>
        <ModalHeader py='3' borderBottom='1px' borderColor='gray.100'>
          <Heading as='h3' size='md'>
            Merchant Information
          </Heading>
        </ModalHeader>
        <ModalCloseButton top='2.5' right='4' />

        <ModalBody py='5' px={{ base: '4', md: '6' }}>
          {draft.isLoading && (
            <HStack>
              <Skeleton w='50%' h='500px' rounded='md' />
              <Skeleton w='50%' h='500px' rounded='md' />
            </HStack>
          )}

          {draft.isSuccess && <MerchantInfo merchantDetails={draft.data} />}
        </ModalBody>

        <ModalFooter>
          <CustomButton colorVariant='accent-outline' mr='3' onClick={onClose}>
            Close
          </CustomButton>

          <CustomButton onClick={handleSubmit} isLoading={changeStatusToReview.isLoading}>
            Submit
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ReviewModal
