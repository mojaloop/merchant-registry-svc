import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Box, Heading, Stack } from '@chakra-ui/react'

import type { AuditLogType } from '@/types/auditLog'
import { CustomButton, DataTable } from '@/components/ui'

const auditLog: AuditLogType = {
  portalUserName: 'tester 1',
  actionType: 'Access',
  applicationModule: 'getMerchants',
  eventDescription: 'User 1 with email d1superadmin1@gmail.com retrieved merchants',
  entityName: 'Merchants',
  oldValue: '',
  newValue: '',
  createdAt: '9/12/2023 9:59:17 AM',
}

const AuditLog = () => {
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<AuditLogType>()

    return [
      columnHelper.accessor('portalUserName', {
        cell: info => info.getValue(),
        header: 'Portal User Name',
      }),
      columnHelper.accessor('actionType', {
        cell: info => info.getValue(),
        header: 'Action Type',
      }),
      columnHelper.accessor('applicationModule', {
        cell: info => info.getValue(),
        header: 'Application Module',
      }),
      columnHelper.accessor('eventDescription', {
        cell: info => info.getValue(),
        header: 'Event Description',
      }),
      columnHelper.accessor('entityName', {
        cell: info => info.getValue(),
        header: 'Entity Name',
      }),
      columnHelper.accessor('oldValue', {
        cell: info => info.getValue() || '...',
        header: 'Old Value',
      }),
      columnHelper.accessor('newValue', {
        cell: info => info.getValue() || '...',
        header: 'New Value',
      }),
      columnHelper.accessor('createdAt', {
        cell: info => info.getValue(),
        header: 'Created At',
      }),
      columnHelper.display({
        id: 'view-details',
        cell: () => (
          <CustomButton mt={{ base: '2', lg: '0' }} mr={{ base: '-2', lg: '3' }}>
            View Details
          </CustomButton>
        ),
        enableSorting: false,
      }),
    ]
  }, [])

  return (
    <Stack minH='full' px={{ base: '4', sm: '6', lg: '8' }} pt='6' pb='14'>
      <Heading size='md' mb='10'>
        Audit Log
      </Heading>

      <Box
        bg='primaryBackground'
        mx={{ base: '-4', sm: '-6', lg: '-8' }}
        mt='5'
        pt='6'
        px='4'
        pb='14'
        flexGrow='1'
        mb='-14'
      >
        <DataTable
          columns={columns}
          data={new Array(10).fill(0).map(() => auditLog)}
          breakpoint='xl'
          alwaysVisibleColumns={[0]}
        />
      </Box>
    </Stack>
  )
}

export default AuditLog
