import {
  Grid,
  GridItem,
  type HeadingProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Heading,
  type GridItemProps,
} from '@chakra-ui/react'

import { CustomButton } from '@/components/ui'
import DetailsItem from './DetailsItem'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
}

const SubHeading = ({ children, ...props }: HeadingProps) => {
  return (
    <Heading as='h4' size='sm' mb='4' fontWeight='semibold' {...props}>
      {children}
    </Heading>
  )
}

const GridItemShell = ({ children, ...props }: GridItemProps) => {
  return (
    <GridItem bg='primaryBackground' rounded='md' px='4' py='3' {...props}>
      {children}
    </GridItem>
  )
}

const ReviewModal = ({ isOpen, onClose }: ReviewModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='inside'>
      <ModalOverlay bg='hsl(0, 0%, 100%, 0.6)' backdropFilter='blur(4px)' />

      <ModalContent w='90vw' maxW='1000px' mt='14' mb={{ base: '14', lg: '0' }}>
        <ModalHeader py='3' borderBottom='1px' borderColor='gray.100'>
          Merchant Information
        </ModalHeader>
        <ModalCloseButton top='2.5' right='4' />

        <ModalBody py='5' px={{ base: '4', md: '6' }}>
          <Grid
            templateRows={{ base: '1fr', lg: 'repeat(4, 1fr)' }}
            templateColumns={{
              base: 'repeat(1, minmax(200px, 1fr))',
              lg: 'repeat(2, 1fr)',
            }}
            gap='4'
          >
            <GridItemShell rowSpan={2}>
              <SubHeading>Business Information</SubHeading>

              <Stack spacing='3'>
                <DetailsItem label='Doing Business As Name' value='K Online Shop' />

                <DetailsItem label='Registered Name' value='K Company Pte.Ltd' />

                <DetailsItem label='Number of Employee' value='11-50' />

                <DetailsItem label='Monthly Turnover' value='20%' />

                <DetailsItem label='Merchant Category' value='Food and Beverage' />

                <DetailsItem label='DFSP Name' value='AA' />
              </Stack>
            </GridItemShell>

            <GridItemShell rowSpan={2}>
              <SubHeading>Location Information</SubHeading>

              <Stack spacing='3'>
                <DetailsItem label='Location Type' value='Virtual' />

                <DetailsItem label='Country' value='Myanmar' />

                <DetailsItem label='State' value='Myanmar' />

                <DetailsItem label='City' value='Myanmar' />

                <DetailsItem label='Longitude Latitude' value='16.8409° N, 96.1735° E' />

                <DetailsItem label='Website URL' value='konlineship.com.mm' />

                <DetailsItem
                  label='Full Address'
                  value='No(33/A), Room No(701), (7th) Fl, Sky View Tower, Aung Zaya Rd, Yankin Tsp.'
                />
              </Stack>
            </GridItemShell>

            <GridItemShell rowSpan={2}>
              <SubHeading>Business Owner Information</SubHeading>

              <Stack spacing='3'>
                <DetailsItem label='Name' value='John' />

                <DetailsItem label='National ID' value='0075981' />

                <DetailsItem label='Nationality' value='Burmese' />

                <DetailsItem
                  label='Address'
                  value='No(33/A),Room No(701),(7th) Fl, Sky View Tower, Aung Zaya Rd,Yankin Tsp.'
                />

                <DetailsItem label='Phone Number' value='09756290742' />

                <DetailsItem label='Email' value='konlineshop@gmail.com' />
              </Stack>
            </GridItemShell>

            <GridItemShell>
              <SubHeading>Contact Person Information</SubHeading>

              <Stack spacing='3'>
                <DetailsItem label='Name' value='John' />

                <DetailsItem label='Phone Number' value='09756290742' />

                <DetailsItem label='Email' value='konlineshop@gmail.com' />
              </Stack>
            </GridItemShell>

            <GridItemShell>
              <SubHeading>Checkout Information</SubHeading>

              <Stack spacing='3'>
                <DetailsItem label='Counter Description' value='Online Shopping - 01' />

                <DetailsItem label='Counter Description2' value='Online Shopping - 02' />
              </Stack>
            </GridItemShell>
          </Grid>
        </ModalBody>

        <ModalFooter>
          <CustomButton colorVariant='accent-outline' mr='3' onClick={onClose}>
            Close
          </CustomButton>

          <CustomButton>Submit</CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ReviewModal
