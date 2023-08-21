import { useRef } from 'react'
import {
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialog as ChakraAlertDialog,
  Icon,
} from '@chakra-ui/react'
import { FiAlertCircle } from 'react-icons/fi'

import { CustomButton } from '..'

interface AlertDialogProps {
  isOpen: boolean
  alertText: string
  onClose: () => void
  onConfirm: () => void
}

const AlertDialog = ({ isOpen, onClose, alertText, onConfirm }: AlertDialogProps) => {
  const cancelRef = useRef<HTMLElement>(null)

  return (
    <ChakraAlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay bg='hsl(0, 0%, 100%, 0.6)' backdropFilter='blur(4px)' />

      <AlertDialogContent w='96' shadow='xl'>
        <AlertDialogHeader display='flex' justifyContent='center'>
          <Icon as={FiAlertCircle} color='danger' boxSize='14' />
        </AlertDialogHeader>

        <AlertDialogBody fontWeight='medium' textAlign='center'>
          {alertText}
        </AlertDialogBody>

        <AlertDialogFooter display='flex' justifyContent='center' gap='4'>
          <CustomButton colorVariant='danger' w='20' onClick={onClose}>
            No
          </CustomButton>

          <CustomButton colorVariant='success' w='20' onClick={onConfirm}>
            Yes
          </CustomButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </ChakraAlertDialog>
  )
}

export default AlertDialog
