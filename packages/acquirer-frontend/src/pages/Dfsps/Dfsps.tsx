import { useMemo, useState } from 'react'
import { createColumnHelper, type PaginationState } from '@tanstack/react-table'
import { Box, Heading, Stack } from '@chakra-ui/react'

import type { dfspInfo } from '@/types/dfsps'
import { useDfsps } from '@/api/hooks/dfsps'
import { useTable } from '@/hooks'
import { DataTable, EmptyState, TableSkeleton } from '@/components/ui'

const Dfsps = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<dfspInfo>()

    return [
      columnHelper.display({
        header: 'No',
        cell: props => <span>{props.row.index + 1}</span>,
      }),
      columnHelper.accessor('dfspId', {
        cell: info => info.getValue(),
        header: 'DFSP ID',
      }),
      columnHelper.accessor('dfspName', {
        cell: info => info.getValue(),
        header: 'DFSP Name',
      }),
      columnHelper.accessor('businessLicenseId', {
        cell: info => info.getValue(),
        header: 'Business License ID',
      }),
      columnHelper.accessor('isUsingAcquiringPortal', {
        cell: info => (info.getValue() ? 'Yes' : 'No'),
        header: 'Is Using Acquiring Portal',
      }),
    ]
  }, [])

  const dfsps = useDfsps({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const table = useTable({
    data: dfsps.data?.data || [],
    columns,
    pagination,
    setPagination,
  })

  return (
    <Stack minH='full' px={{ base: '4', sm: '6', lg: '8' }} pt='0' pb='14'>
      <Box
        bg='primaryBackground'
        mx={{ base: '-4', sm: '-6', lg: '-8' }}
        mt='5'
        pt='0'
        px='4'
        pb='14'
        flexGrow='1'
        mb='-14'
      >
        <Heading size='md' mb={4} mt={7} ml={9}>
          DFSP List
        </Heading>
        {dfsps.isFetching && (
          <TableSkeleton breakpoint='xl' mt={{ base: '3', xl: '4' }} />
        )}

        <DataTable
          table={table}
          totalPages={dfsps.data?.totalPages || 0}
          breakpoint='xl'
          alwaysVisibleColumns={[0]}
        />

        {/* Show "No DFSPs" message */}
        {!dfsps.isLoading && dfsps.data?.data.length === 0 && (
          <EmptyState text='There are no DFSPs.' mt='10' />
        )}

        {/* Show TableSkeleton while fetching data */}
        {dfsps.isLoading && <TableSkeleton breakpoint='xl' mt={{ base: '3', xl: '4' }} />}
      </Box>
    </Stack>
  )
}

export default Dfsps
