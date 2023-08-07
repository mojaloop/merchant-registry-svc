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
import { useEffect, useState } from 'react'
import instance from '@/lib/axiosInstance'
import { CustomButton } from '@/components/ui'
import DetailsItem from './DetailsItem'
import { MerchantDetails } from './MerchantDetailsType'

interface MerchantInformationModalProps {
  selectedMerchantId: number | null
  isOpen: boolean
  onClose: () => void
}

interface MerchantDetailsAxiosData {
  data: MerchantDetails
  message: string
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

const MerchantInformationModal = ({
  isOpen,
  onClose,
  selectedMerchantId,
}: MerchantInformationModalProps) => {
  const [merchantDetails, setMerchantDetails] = useState<MerchantDetails | null>(null)
  useEffect(() => {
    if (isOpen && selectedMerchantId) {
      const fetchMerchantDetails = async () => {
        try {
          const response = await instance.get<MerchantDetailsAxiosData>(
            `/merchants/${selectedMerchantId}`
          )
          console.log(response)
          setMerchantDetails(response.data.data)
        } catch (error) {
          console.error('Error fetching merchant details:', error)
        }
      }

      fetchMerchantDetails()
    }
  }, [isOpen, selectedMerchantId])
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
                  value={merchantDetails?.dba_trading_name || 'N/A'}
                />

                <DetailsItem
                  label='Registered Name'
                  value={merchantDetails?.registered_name || 'N/A'}
                />

                <DetailsItem
                  label='Number of Employee'
                  value={merchantDetails?.employees_num || 'N/A'}
                />

                <DetailsItem
                  label='Monthly Turnover'
                  value={merchantDetails?.monthly_turnover || 'N/A'}
                />

                <DetailsItem
                  label='Merchant Category'
                  value={merchantDetails?.category_code.description || 'N/A'}
                />

                <DetailsItem label='DFSP Name' value='N/A' />
              </Stack>
            </GridItemShell>

            <GridItemShell rowSpan={2}>
              <SubHeading>Location Information</SubHeading>

              <Stack spacing='3'>
                <DetailsItem
                  label='Location Type'
                  value={merchantDetails?.locations[0]?.location_type || 'N/A'}
                />

                <DetailsItem
                  label='Country'
                  value={merchantDetails?.locations[0]?.country || 'N/A'}
                />

                <DetailsItem
                  label='State'
                  value={merchantDetails?.locations[0]?.country_subdivision || 'N/A'}
                />

                <DetailsItem
                  label='City'
                  value={merchantDetails?.locations[0]?.town_name || 'N/A'}
                />

                <DetailsItem
                  label='Longitude Latitude'
                  value={
                    (merchantDetails?.locations[0]?.longitude || 'N/A') +
                    ' ' +
                    (merchantDetails?.locations[0]?.latitude || 'N/A')
                  }
                />

                <DetailsItem
                  label='Website URL'
                  value={merchantDetails?.locations[0]?.web_url || 'N/A'}
                />

                <DetailsItem
                  label='Full Address'
                  value={merchantDetails?.locations[0]?.address_line || 'N/A'}
                />
              </Stack>
            </GridItemShell>

            <GridItemShell rowSpan={2}>
              <SubHeading>Business Owner Information</SubHeading>

              <Stack spacing='3'>
                <DetailsItem
                  label='Name'
                  value={merchantDetails?.business_owners[0]?.name || 'N/A'}
                />

                <DetailsItem
                  label='ID Type'
                  value={merchantDetails?.business_owners[0]?.identificaton_type || 'N/A'}
                />
                <DetailsItem
                  label='ID'
                  value={
                    merchantDetails?.business_owners[0]?.identification_number || 'N/A'
                  }
                />

                <DetailsItem
                  label='Address'
                  value={
                    merchantDetails?.business_owners[0]?.businessPersonLocation
                      ?.address_line || 'N/A'
                  }
                />

                <DetailsItem
                  label='Phone Number'
                  value={merchantDetails?.business_owners[0]?.phone_number || 'N/A'}
                />

                <DetailsItem
                  label='Email'
                  value={merchantDetails?.business_owners[0]?.email || 'N/A'}
                />
              </Stack>
            </GridItemShell>

            <GridItemShell>
              <SubHeading>Contact Person Information</SubHeading>

              <Stack spacing='3'>
                <DetailsItem
                  label='Name'
                  value={merchantDetails?.contact_persons[0]?.name || 'N/A'}
                />

                <DetailsItem
                  label='Phone Number'
                  value={merchantDetails?.contact_persons[0]?.phone_number || 'N/A'}
                />

                <DetailsItem
                  label='Email'
                  value={merchantDetails?.contact_persons[0]?.email || 'N/A'}
                />
              </Stack>
            </GridItemShell>

            <GridItemShell>
              <SubHeading>Checkout Information</SubHeading>

              {merchantDetails?.checkout_counters.map((counter, index) => (
                <Stack key={index} spacing='3'>
                  <DetailsItem
                    label='Counter Alias PayInto'
                    value={counter.alias_value || 'N/A'}
                  />

                  <DetailsItem
                    label='Counter Description'
                    value={counter.description || 'N/A'}
                  />
                </Stack>
              ))}
            </GridItemShell>
          </Grid>
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
