import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Flex,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from '@chakra-ui/react'
import { FaRegFileLines } from 'react-icons/fa6'
import { LuFileCheck } from 'react-icons/lu'
import { MdOutlineCloudUpload } from 'react-icons/md'

import { CustomButton } from '@/components/ui'

import './fileUploadModal.css'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  isUploading: boolean
  setIsUploading: (isUploading: boolean) => void
  openFileInput: () => void
  setFile: (file: File) => void
}

const FileUploadModal = ({
  isOpen,
  onClose,
  isUploading,
  setIsUploading,
  openFileInput,
  setFile,
}: FileUploadModalProps) => {
  const intervalRef = useRef<NodeJS.Timeout>()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const strokeDashoffset = 190 - (190 * uploadProgress) / 100

  useEffect(() => {
    if (!isUploading) return

    intervalRef.current = setInterval(() => {
      setUploadProgress(prevState => prevState + 10)
    }, 150)
  }, [isUploading])

  useEffect(() => {
    if (uploadProgress === 100) {
      clearInterval(intervalRef.current)
      setIsUploading(false)
    }
  }, [uploadProgress, setIsUploading])

  const resetUploadStates = () => {
    setUploadProgress(0)
    setIsUploading(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetUploadStates()
        onClose()
      }}
    >
      <ModalOverlay bg='hsl(0, 0%, 100%, 0.6)' backdropFilter='blur(4px)' />

      <ModalContent w='90vw' maxW='750px' my='auto'>
        <ModalHeader py='3' borderBottom='1px' borderColor='gray.100'>
          <Heading as='h3' size='md'>
            Upload File
          </Heading>
        </ModalHeader>
        <ModalCloseButton top='2.5' right='4' />

        <ModalBody py='5' px={{ base: '6', md: '10' }}>
          <Text>Upload your PDF File to share your license documents.</Text>

          <Flex
            align='center'
            justify='center'
            w='full'
            h='270px'
            mt='8'
            bg={isDraggingOver ? 'blue.50' : 'white'}
            borderWidth='1px'
            borderStyle='dashed'
            borderColor='#c5c5c5'
            rounded='md'
            className={isDraggingOver ? 'dragging-over' : ''}
            onDrop={e => {
              e.preventDefault()
              setIsDraggingOver(false)
              resetUploadStates()

              if (e.dataTransfer.files[0].type !== 'application/pdf') return

              setFile(e.dataTransfer.files[0])
              setIsUploading(true)
            }}
            onDragOver={e => e.preventDefault()}
            onDragEnter={() => setIsDraggingOver(true)}
            onDragLeave={() => setIsDraggingOver(false)}
            data-testid='dropzone'
          >
            <Stack content='center' align='center' spacing='3'>
              <Box w='20' h='20' position='relative'>
                {!isUploading && uploadProgress === 0 && (
                  <Icon
                    as={MdOutlineCloudUpload}
                    boxSize={12}
                    position='absolute'
                    top='50%'
                    left='50%'
                    transform='auto'
                    translateX='-50%'
                    translateY='-50%'
                  />
                )}

                {isUploading && (
                  <Icon
                    as={FaRegFileLines}
                    boxSize={6}
                    position='absolute'
                    top='50%'
                    left='50%'
                    transform='auto'
                    translateX='-50%'
                    translateY='-50%'
                  />
                )}

                {!isUploading && uploadProgress === 100 && (
                  <Icon
                    as={LuFileCheck}
                    boxSize={6}
                    position='absolute'
                    top='50%'
                    left='50%'
                    transform='auto'
                    translateX='-50%'
                    translateY='-50%'
                    color='green.400'
                  />
                )}

                {uploadProgress > 0 && (
                  <svg viewBox='0 0 80 80' style={{ rotate: '-90deg' }}>
                    <circle
                      cx='40'
                      cy='40'
                      r='30'
                      fill='none'
                      stroke='#DDE1E3'
                      strokeWidth={4}
                      strokeDasharray={190}
                      strokeDashoffset={0}
                      strokeLinecap='round'
                    />
                    <circle
                      cx='40'
                      cy='40'
                      r='30'
                      fill='none'
                      stroke='#48BB78'
                      strokeWidth={4}
                      strokeDashoffset={strokeDashoffset}
                      strokeDasharray={190}
                      strokeLinecap='round'
                      style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
                    />
                  </svg>
                )}
              </Box>

              <Box textAlign='center' fontSize='sm'>
                {!isUploading && uploadProgress === 0 && (
                  <>
                    <Text>Drag & Drop you PDF file here</Text>
                    <Text>OR</Text>
                  </>
                )}

                {isUploading && <Text>Uploading file...</Text>}

                {!isUploading && uploadProgress === 100 && (
                  <Text>File uploaded successfully!</Text>
                )}
              </Box>

              {!isUploading && uploadProgress === 0 && (
                <CustomButton colorVariant='info' onClick={openFileInput}>
                  Browse Files
                </CustomButton>
              )}
            </Stack>
          </Flex>
        </ModalBody>

        <ModalFooter px='0'>
          <CustomButton
            isDisabled={!(uploadProgress === 100)}
            mr={{ base: '6', md: '10' }}
            onClick={() => {
              onClose()
              resetUploadStates()
            }}
          >
            Submit
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default FileUploadModal
