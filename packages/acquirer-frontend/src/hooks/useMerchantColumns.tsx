import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Box, Checkbox, HStack, Stack, Text } from '@chakra-ui/react'
import { MerchantRegistrationStatus } from 'shared-lib'

import type { MerchantInfo } from '@/types/merchants'
import {
  REGISTRATION_STATUS_COLORS,
  type RegistrationStatus,
} from '@/constants/registrationStatus'
import { CustomButton, CustomLink } from '@/components/ui'

interface UseMerchantColumnsProps {
  onViewDetails: (merchantId: number) => void
  showSelectColumn?: boolean
  showProceedColumn?: boolean
  userProfile?: { id: number } | null
  includeRegisteredName?: boolean
  includeLEI?: boolean
}

export const useMerchantColumns = ({
  onViewDetails,
  showSelectColumn = false,
  showProceedColumn = false,
  userProfile = null,
  includeRegisteredName = false,
  includeLEI = true,
}: UseMerchantColumnsProps) => {
  return useMemo(() => {
    const columnHelper = createColumnHelper<MerchantInfo>()
    const columns = []

    // Select column for pending merchants
    if (showSelectColumn) {
      columns.push(
        columnHelper.display({
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              isChecked={table.getIsAllPageRowsSelected()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                table.toggleAllPageRowsSelected(!!e.target.checked)
              }
              aria-label='Select all'
              borderColor='blackAlpha.400'
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              isDisabled={userProfile?.id === row.original.maker.id}
              isChecked={
                userProfile?.id === row.original.maker.id ? false : row.getIsSelected()
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                row.toggleSelected(!!e.target.checked)
              }
              aria-label='Select row'
              borderColor='blackAlpha.400'
            />
          ),
          enableSorting: false,
        })
      )
    }

    // ID column
    columns.push(
      columnHelper.accessor('no', {
        cell: info => info.getValue(),
        header: 'ID',
      })
    )

    // DBA Name column
    columns.push(
      columnHelper.accessor('dbaName', {
        cell: info => info.getValue(),
        header: 'Doing Business As Name',
      })
    )

    // Registered Name column (for rejected/reverted)
    if (includeRegisteredName) {
      columns.push(
        columnHelper.accessor('registeredName', {
          cell: info => info.getValue(),
          header: 'Registered Name',
        })
      )
    }

    // LEI column (optional for some views)
    if (includeLEI) {
      columns.push(
        columnHelper.accessor('lei', {
          cell: info => info.getValue() || 'N/A',
          header: 'LEI',
        })
      )
    }

    // Common columns
    columns.push(
      columnHelper.accessor('payintoAccountId', {
        cell: info => info.getValue(),
        header: 'Payinto Account ID',
      }),
      columnHelper.accessor('merchantType', {
        cell: info => info.getValue(),
        header: 'Merchant Type',
      }),
      columnHelper.accessor('town', {
        cell: info => info.getValue(),
        header: 'Town',
      }),
      columnHelper.accessor('countrySubdivision', {
        cell: info => info.getValue(),
        header: 'Country Subdivision',
      }),
      columnHelper.accessor('counterDescription', {
        cell: info => info.getValue(),
        header: 'Counter Description',
      }),
      columnHelper.accessor('registeredDfspName', {
        cell: info => info.getValue(),
        header: 'Registered DFSP Name',
      }),
      columnHelper.accessor('maker.name', {
        cell: info => info.getValue(),
        header: 'Maker Username',
      }),
      columnHelper.accessor('registrationStatus', {
        cell: info => (
          <HStack justify='center' spacing='1'>
            <Box
              as='span'
              minW='2'
              w='2'
              h='2'
              borderRadius='full'
              bg={REGISTRATION_STATUS_COLORS[info.getValue() as RegistrationStatus]}
            />

            <Text>{info.getValue()}</Text>
          </HStack>
        ),
        header: 'Registration Status',
      }),
      columnHelper.accessor('gleif_verified_at', {
        id: 'gleif-validation-status',
        cell: ({ row }) => {
          const verificationDate = row.original.gleif_verified_at
          const status = row.original.registrationStatus as MerchantRegistrationStatus
          const isValidated =
            status === MerchantRegistrationStatus.APPROVED ||
            status === MerchantRegistrationStatus.REVIEW

          if (verificationDate) {
            const date = new Date(verificationDate)
            return (
              <Stack spacing={1}>
                <Text color='green.600' fontWeight='semibold' fontSize='sm'>
                  Verified
                </Text>
                <Text fontSize='xs' color='gray.600'>
                  {date.toLocaleDateString()}{' '}
                  {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Stack>
            )
          } else if (isValidated) {
            return (
              <Text color='green.600' fontWeight='semibold' fontSize='sm'>
                Validated (Legacy)
              </Text>
            )
          } else {
            return (
              <Text color='orange.500' fontWeight='semibold' fontSize='sm'>
                Pending
              </Text>
            )
          }
        },
        header: 'Last Verification',
      }),
      columnHelper.display({
        id: 'view-details',
        cell: ({ row }) => (
          <CustomButton
            mt={{ base: '2', lg: '0' }}
            mr={{ base: '-2', lg: '3' }}
            onClick={() => {
              onViewDetails(row.original.no)
            }}
          >
            View Details
          </CustomButton>
        ),
        enableSorting: false,
      })
    )

    // Proceed column for reverted merchants
    if (showProceedColumn) {
      columns.push(
        columnHelper.display({
          id: 'proceed',
          cell: ({ row }) => (
            <CustomLink
              to='/registry/registry-form'
              mt={{ base: '2', lg: '0' }}
              mr={{ base: '-2', lg: '3' }}
              onClick={() => {
                localStorage.setItem('merchantId', row.original.no.toString())
              }}
            >
              Proceed
            </CustomLink>
          ),
          enableSorting: false,
        })
      )
    }

    return columns
  }, [
    onViewDetails,
    showSelectColumn,
    showProceedColumn,
    userProfile,
    includeRegisteredName,
    includeLEI,
  ])
}
