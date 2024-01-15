import {
  Box,
  Grid,
  GridItem,
  Heading,
  HStack,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
  type GridItemProps,
  type HeadingProps,
} from '@chakra-ui/react'

import type { MerchantDetails } from '@/types/merchantDetails'
import { formatLatitudeLongitude } from '@/utils'
import { useMerchant } from '@/api/hooks/merchants'
import { CustomButton, Skeleton } from '@/components/ui'
import { DetailsItem } from '.'
import QRCodeModal from './QRCodeModal'

interface MerchantInformationModalProps {
  selectedMerchantId: number
  isOpen: boolean
  onClose: () => void
}

export const SubHeading = ({ children, ...props }: HeadingProps) => {
  return (
    <Heading as='h4' size='sm' mb='4' fontWeight='semibold' {...props}>
      {children}
    </Heading>
  )
}

export const GridItemShell = ({ children, ...props }: GridItemProps) => {
  return (
    <GridItem bg='primaryBackground' rounded='md' px='4' py='3' {...props}>
      {children}
    </GridItem>
  )
}

export const MerchantInfo = ({
  merchantDetails,
}: {
  merchantDetails: MerchantDetails
}) => {
  const {
    dba_trading_name,
    registered_name,
    employees_num,
    monthly_turnover,
    category_code,
    merchant_type,
    default_dfsp,
    currency_code,
    business_licenses,
    checkout_counters,
    locations,
    business_owners,
    contact_persons,
    registration_status,
    registration_status_reason,
  } = merchantDetails

  const businessLicense = business_licenses?.[0]
  const checkoutCounter = checkout_counters?.[0]
  const location = locations?.[0]
  const businessOwner = business_owners?.[0]
  const contactPerson = contact_persons?.[0]

  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      {(registration_status === 'Reverted' || registration_status === 'Rejected') && (
        <Box bg='primaryBackground' mb='4' px='4' py='3' color='danger' rounded='md'>
          <Heading as='h4' size='sm' mb='3'>
            {registration_status} Reason
          </Heading>

          <Text fontSize='sm'>{registration_status_reason}</Text>
        </Box>
      )}

      <Grid
        templateRows={{ base: '1fr', lg: 'repeat(4, 1fr)' }}
        templateColumns={{
          base: 'repeat(1, minmax(200px, 1fr))',
          lg: 'repeat(2, 1fr)',
        }}
        gap='4'
        data-testid='merchant-information'
      >
        {/* c8 ignore next 215 */}
        <GridItemShell rowSpan={2}>
          <SubHeading>Business Information</SubHeading>

          <Stack spacing='3'>
            <DetailsItem
              label='Doing Business As Name'
              value={dba_trading_name || 'N/A'}
            />

            <DetailsItem label='Registered Name' value={registered_name || 'N/A'} />

            <DetailsItem
              label='Payinto Account'
              value={checkoutCounter?.alias_value || 'N/A'}
            />

            <DetailsItem label='Number of Employee' value={employees_num || 'N/A'} />

            <DetailsItem
              label='Monthly Turnover'
              value={monthly_turnover ? `${monthly_turnover}%` : 'N/A'}
            />

            <DetailsItem
              label='Merchant Category'
              value={category_code?.description || 'N/A'}
            />

            <DetailsItem label='Merchant Type' value={merchant_type || 'N/A'} />

            <DetailsItem label='DFSP Name' value={default_dfsp?.name || 'N/A'} />

            <DetailsItem label='Currency' value={currency_code?.iso_code || 'N/A'} />

            <DetailsItem
              label='Licence Number'
              value={businessLicense?.license_number || 'N/A'}
            />

            <DetailsItem
              label='Licence Document'
              value={
                businessLicense?.license_document_link ? (
                  <Link
                    href={businessLicense?.license_document_link}
                    download
                    color='blue.500'
                    data-testid='license-document-link'
                  >
                    License Document
                  </Link>
                ) : (
                  'N/A'
                )
              }
            />
          </Stack>
        </GridItemShell>

        <GridItemShell rowSpan={2}>
          <SubHeading>Location Information</SubHeading>

          <Stack spacing='3'>
            <DetailsItem label='Location Type' value={location?.location_type || 'N/A'} />

            <DetailsItem label='Country' value={location?.country || 'N/A'} />

            <DetailsItem
              label='Latitude Longitude'
              value={formatLatitudeLongitude(location?.latitude, location?.longitude)}
            />

            <DetailsItem label='Website URL' value={location?.web_url || 'N/A'} />

            <DetailsItem label='Department' value={location?.department || 'N/A'} />

            <DetailsItem
              label='Sub Department'
              value={location?.sub_department || 'N/A'}
            />

            <DetailsItem label='Street Name' value={location?.street_name || 'N/A'} />

            <DetailsItem
              label='Building Number'
              value={location?.building_number || 'N/A'}
            />

            <DetailsItem label='Building Name' value={location?.building_name || 'N/A'} />

            <DetailsItem label='Floor Number' value={location?.floor_number || 'N/A'} />

            <DetailsItem label='Room Number' value={location?.room_number || 'N/A'} />

            <DetailsItem label='Post Box' value={location?.post_box || 'N/A'} />

            <DetailsItem label='Postal Code' value={location?.postal_code || 'N/A'} />

            <DetailsItem label='Township' value={location?.town_name || 'N/A'} />

            <DetailsItem label='District' value={location?.district_name || 'N/A'} />

            <DetailsItem
              label='Country Subdivision'
              value={location?.country_subdivision || 'N/A'}
            />
          </Stack>
        </GridItemShell>

        <GridItemShell rowSpan={2}>
          <SubHeading>Business Owner Information</SubHeading>

          <Stack spacing='3'>
            <DetailsItem label='Name' value={businessOwner?.name || 'N/A'} />

            <DetailsItem
              label={businessOwner?.identificaton_type}
              value={businessOwner?.identification_number || 'N/A'}
            />

            <DetailsItem
              label='Phone Number'
              value={businessOwner?.phone_number || 'N/A'}
            />

            <DetailsItem label='Email' value={businessOwner?.email || 'N/A'} />

            <DetailsItem
              label='Country'
              value={businessOwner?.businessPersonLocation?.country || 'N/A'}
            />

            <DetailsItem
              label='Latitude Longitude'
              value={formatLatitudeLongitude(
                businessOwner?.businessPersonLocation?.latitude,
                businessOwner?.businessPersonLocation?.longitude
              )}
            />

            <DetailsItem
              label='Department'
              value={businessOwner?.businessPersonLocation?.department || 'N/A'}
            />

            <DetailsItem
              label='Sub Department'
              value={businessOwner?.businessPersonLocation?.sub_department || 'N/A'}
            />

            <DetailsItem
              label='Street Name'
              value={businessOwner?.businessPersonLocation?.street_name || 'N/A'}
            />

            <DetailsItem
              label='Building Number'
              value={businessOwner?.businessPersonLocation?.building_number || 'N/A'}
            />

            <DetailsItem
              label='Building Name'
              value={businessOwner?.businessPersonLocation?.building_name || 'N/A'}
            />

            <DetailsItem
              label='Floor Number'
              value={businessOwner?.businessPersonLocation?.floor_number || 'N/A'}
            />

            <DetailsItem
              label='Room Number'
              value={businessOwner?.businessPersonLocation?.room_number || 'N/A'}
            />

            <DetailsItem
              label='Post Box'
              value={businessOwner?.businessPersonLocation?.post_box || 'N/A'}
            />

            <DetailsItem
              label='Postal Code'
              value={businessOwner?.businessPersonLocation?.postal_code || 'N/A'}
            />

            <DetailsItem
              label='Township'
              value={businessOwner?.businessPersonLocation?.town_name || 'N/A'}
            />

            <DetailsItem
              label='District'
              value={businessOwner?.businessPersonLocation?.district_name || 'N/A'}
            />

            <DetailsItem
              label='Country Subdivision'
              value={businessOwner?.businessPersonLocation?.country_subdivision || 'N/A'}
            />
          </Stack>
        </GridItemShell>

        <GridItemShell>
          <SubHeading>Contact Person Information</SubHeading>

          <Stack spacing='3'>
            <DetailsItem label='Name' value={contactPerson?.name || 'N/A'} />

            <DetailsItem
              label='Phone Number'
              value={contactPerson?.phone_number || 'N/A'}
            />

            <DetailsItem label='Email' value={contactPerson?.email || 'N/A'} />
          </Stack>
        </GridItemShell>

        <GridItemShell>
          <SubHeading>Checkout Information</SubHeading>

          <Stack spacing='3'>
            <DetailsItem
              label='Counter Description'
              value={checkoutCounter?.description || 'N/A'}
            />

            {checkoutCounter?.qr_code_link && (
              <>
                <CustomButton alignSelf='start' colorVariant='info' onClick={onOpen}>
                  View QR Code
                </CustomButton>
                <QRCodeModal
                  isOpen={isOpen}
                  onClose={onClose}
                  qrCodeUrl={checkoutCounter?.qr_code_link}
                />
              </>
            )}
          </Stack>
        </GridItemShell>
      </Grid>
    </>
  )
}

const MerchantInformationModal = ({
  isOpen,
  onClose,
  selectedMerchantId,
}: MerchantInformationModalProps) => {
  const merchant = useMerchant(selectedMerchantId)

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
          {merchant.isLoading && (
            <HStack data-testid='skeleton-loading'>
              <Skeleton w='50%' h='500px' rounded='md' />
              <Skeleton w='50%' h='500px' rounded='md' />
            </HStack>
          )}

          {merchant.isSuccess && <MerchantInfo merchantDetails={merchant.data} />}
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

export default MerchantInformationModal
