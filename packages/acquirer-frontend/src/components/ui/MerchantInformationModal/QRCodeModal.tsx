import {
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Skeleton,
} from '@chakra-ui/react'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  qrCodeUrl: string
}

const QRCodeModal = ({ isOpen, onClose, qrCodeUrl }: QRCodeModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay bg='hsl(0, 0%, 100%, 0.6)' backdropFilter='blur(4px)' />

      <ModalContent w='90vw' maxW='26rem' my='10'>
        <ModalHeader py='3' borderBottom='1px' borderColor='gray.100'>
          <Heading as='h3' size='md'>
            Scan QR Code
          </Heading>
        </ModalHeader>
        <ModalCloseButton top='2.5' right='4' />

        <ModalBody py='5' px={{ base: '4', md: '6' }}>
          <Image
            src={qrCodeUrl}
            fallback={<Skeleton h='490px' />}
            alt='QR Code'
            h='490px'
            w='100%'
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default QRCodeModal
