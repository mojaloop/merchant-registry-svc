import {
  Box,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react'

import type { AuditLogType } from '@/types/auditLogs'
import { CustomButton } from '@/components/ui'
import { DetailsItem } from '@/components/ui/MerchantInformationModal'

interface AuditLogDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  auditLog: AuditLogType
}

const AuditLogDetailsModal = ({
  isOpen,
  onClose,
  auditLog,
}: AuditLogDetailsModalProps) => {
  const {
    portalUserName,
    actionType,
    applicationModule,
    eventDescription,
    entityName,
    oldValue,
    newValue,
    transactionStatus,
    createdAt,
  } = auditLog

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='inside'>
      <ModalOverlay bg='hsl(0, 0%, 100%, 0.6)' backdropFilter='blur(4px)' />

      <ModalContent w='90vw' maxW='750px' mt='14' mb={{ base: '14', lg: '0' }}>
        <ModalHeader py='3' borderBottom='1px' borderColor='gray.100'>
          <Heading as='h3' size='md'>
            Audit Log Details
          </Heading>
        </ModalHeader>
        <ModalCloseButton top='2.5' right='4' />

        <ModalBody py='5' px={{ base: '4', md: '6' }}>
          <Stack w='90%' spacing='4' mx='auto'>
            <DetailsItem label='Portal User Name' value={portalUserName} />

            <DetailsItem label='Action Type' value={actionType} />

            <DetailsItem label='Application Module' value={applicationModule} />

            <DetailsItem label='Event Description' value={eventDescription} />

            <DetailsItem label='Entity Name' value={entityName} />

            <DetailsItem
              label='Old Value'
              value={<Box as='pre'>{JSON.stringify(JSON.parse(oldValue), null, 2)}</Box>}
            />

            <DetailsItem
              label='New Value'
              value={<Box as='pre'>{JSON.stringify(JSON.parse(newValue), null, 2)}</Box>}
            />

            <DetailsItem label='Transaction Status' value={transactionStatus} />

            <DetailsItem label='Created At' value={createdAt} />
          </Stack>
        </ModalBody>

        <ModalFooter>
          <CustomButton colorVariant='info' mr='3' onClick={onClose}>
            Close
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AuditLogDetailsModal
