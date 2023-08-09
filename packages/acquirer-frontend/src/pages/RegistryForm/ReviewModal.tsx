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
import { isAxiosError } from 'axios'

import type { DraftData } from '@/types/form'
import instance from '@/lib/axiosInstance'
import { CustomButton } from '@/components/ui'
import DetailsItem from '@/components/ui/MerchantInformationModal/DetailsItem'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  draftData: DraftData
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

const ReviewModal = ({ isOpen, onClose, draftData }: ReviewModalProps) => {
  const {
    dba_trading_name,
    registered_name,
    employees_num,
    monthly_turnover,
    category_code,
    merchant_type,
    dfsp_name,
    currency_code,
    checkout_counters,
    locations,
    business_owners,
    contact_persons,
  } = draftData

  const checkoutCounter = checkout_counters?.[0]
  const location = locations?.[0]
  const businessOwner = business_owners?.[0]
  const contactPerson = contact_persons?.[0]

  const handleSubmit = async () => {
    const merchantId = sessionStorage.getItem('merchantId')

    try {
      await instance.put(`/merchants/${merchantId}/ready-to-review`, null, {
        headers: {
          Authorization: `Bearer test_1_dummy_auth_token`,
        },
      })

      sessionStorage.removeItem('merchantId')
      onClose()
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error)
        alert(
          error.response?.data?.error || 'Something went wrong! Please try again later.'
        )
      }
    }
  }

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
                <DetailsItem
                  label='Doing Business As Name'
                  value={dba_trading_name ?? ''}
                />

                <DetailsItem label='Registered Name' value={registered_name ?? ''} />

                <DetailsItem
                  label='Payinto Account'
                  value={checkoutCounter?.alias_value ?? ''}
                />

                <DetailsItem label='Number of Employee' value={employees_num ?? ''} />

                <DetailsItem
                  label='Monthly Turnover'
                  value={`${monthly_turnover}%` ?? ''}
                />

                <DetailsItem
                  label='Merchant Category'
                  value={category_code?.description ?? ''}
                />

                <DetailsItem label='Merchant Type' value={merchant_type ?? ''} />

                <DetailsItem label='DFSP Name' value={dfsp_name ?? ''} />

                <DetailsItem label='Currency' value={currency_code?.iso_code ?? ''} />
              </Stack>
            </GridItemShell>

            <GridItemShell rowSpan={2}>
              <SubHeading>Location Information</SubHeading>

              <Stack spacing='3'>
                <DetailsItem
                  label='Location Type'
                  value={location?.location_type ?? ''}
                />

                <DetailsItem label='Country' value={location?.country ?? ''} />

                <DetailsItem
                  label='Latitude Longitude'
                  value={`${location?.latitude ?? ''}${
                    location?.latitude && location?.longitude ? ',' : ''
                  } ${location?.longitude ?? ''}`}
                />

                <DetailsItem label='Website URL' value={location?.web_url ?? ''} />

                <DetailsItem label='Department' value={location?.department ?? ''} />

                <DetailsItem
                  label='Sub Department'
                  value={location?.sub_department ?? ''}
                />

                <DetailsItem label='Street Name' value={location?.street_name ?? ''} />

                <DetailsItem
                  label='Building Number'
                  value={location?.building_number ?? ''}
                />

                <DetailsItem
                  label='Building Name'
                  value={location?.building_name ?? ''}
                />

                <DetailsItem label='Floor Number' value={location?.floor_number ?? ''} />

                <DetailsItem label='Room Number' value={location?.room_number ?? ''} />

                <DetailsItem label='Post Box' value={location?.post_box ?? ''} />

                <DetailsItem label='Postal Code' value={location?.postal_code ?? ''} />

                <DetailsItem label='Township' value={location?.town_name ?? ''} />

                <DetailsItem label='District' value={location?.district_name ?? ''} />

                <DetailsItem
                  label='Country Subdivision'
                  value={location?.country_subdivision ?? ''}
                />
              </Stack>
            </GridItemShell>

            <GridItemShell rowSpan={2}>
              <SubHeading>Business Owner Information</SubHeading>

              <Stack spacing='3'>
                <DetailsItem label='Name' value={businessOwner?.name ?? ''} />

                <DetailsItem
                  label='National ID'
                  value={businessOwner?.identificaton_type ?? ''}
                />

                <DetailsItem
                  label='Nationality'
                  value={businessOwner?.identification_number ?? ''}
                />

                <DetailsItem
                  label='Phone Number'
                  value={businessOwner?.phone_number ?? ''}
                />

                <DetailsItem label='Email' value={businessOwner?.email ?? ''} />

                <DetailsItem
                  label='Country'
                  value={businessOwner?.businessPersonLocation?.country ?? ''}
                />

                <DetailsItem
                  label='Latitude Longitude'
                  value={`${businessOwner?.businessPersonLocation?.latitude ?? ''}${
                    businessOwner?.businessPersonLocation?.latitude &&
                    businessOwner?.businessPersonLocation?.longitude
                      ? ','
                      : ''
                  } ${businessOwner?.businessPersonLocation?.longitude ?? ''}`}
                />

                <DetailsItem
                  label='Department'
                  value={businessOwner?.businessPersonLocation?.department ?? ''}
                />

                <DetailsItem
                  label='Sub Department'
                  value={businessOwner?.businessPersonLocation?.sub_department ?? ''}
                />

                <DetailsItem
                  label='Street Name'
                  value={businessOwner?.businessPersonLocation?.street_name ?? ''}
                />

                <DetailsItem
                  label='Building Number'
                  value={businessOwner?.businessPersonLocation?.building_number ?? ''}
                />

                <DetailsItem
                  label='Building Name'
                  value={businessOwner?.businessPersonLocation?.building_name ?? ''}
                />

                <DetailsItem
                  label='Floor Number'
                  value={businessOwner?.businessPersonLocation?.floor_number ?? ''}
                />

                <DetailsItem
                  label='Room Number'
                  value={businessOwner?.businessPersonLocation?.room_number ?? ''}
                />

                <DetailsItem
                  label='Post Box'
                  value={businessOwner?.businessPersonLocation?.post_box ?? ''}
                />

                <DetailsItem
                  label='Postal Code'
                  value={businessOwner?.businessPersonLocation?.postal_code ?? ''}
                />

                <DetailsItem
                  label='Township'
                  value={businessOwner?.businessPersonLocation?.town_name ?? ''}
                />

                <DetailsItem
                  label='District'
                  value={businessOwner?.businessPersonLocation?.district_name ?? ''}
                />

                <DetailsItem
                  label='Country Subdivision'
                  value={businessOwner?.businessPersonLocation?.country_subdivision ?? ''}
                />
              </Stack>
            </GridItemShell>

            <GridItemShell>
              <SubHeading>Contact Person Information</SubHeading>

              <Stack spacing='3'>
                <DetailsItem label='Name' value={contactPerson?.name ?? ''} />

                <DetailsItem
                  label='Phone Number'
                  value={contactPerson?.phone_number ?? ''}
                />

                <DetailsItem label='Email' value={contactPerson?.email ?? ''} />
              </Stack>
            </GridItemShell>

            <GridItemShell>
              <SubHeading>Checkout Information</SubHeading>

              <Stack spacing='3'>
                <DetailsItem
                  label='Counter Description'
                  value={checkoutCounter?.description ?? ''}
                />
              </Stack>
            </GridItemShell>
          </Grid>
        </ModalBody>

        <ModalFooter>
          <CustomButton colorVariant='accent-outline' mr='3' onClick={onClose}>
            Close
          </CustomButton>

          <CustomButton onClick={handleSubmit}>Submit</CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ReviewModal
