import { useState } from 'react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableContainer,
  type TableContainerProps,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  type TableRowProps,
  HStack,
} from '@chakra-ui/react'

import type { MerchantInfo } from '@/types/merchants'
import { useUserProfile } from '@/api/hooks/users'
import { CustomButton } from '@/components/ui'
import { MobileTable, PaginationControl } from '@/components/ui/DataTable'

interface PendingMerchantsDataTableProps extends TableContainerProps {
  data: MerchantInfo[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<MerchantInfo, any>[]
  alwaysVisibleColumns: number[]
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  onExport: () => void
  onReject: (ids: number[]) => void
  onApprove: (ids: number[]) => void
  onRevert: (ids: number[]) => void
  hidePerPage?: boolean
  rowStyle?: TableRowProps
}

const PendingMerchantsDataTable = ({
  data,
  columns,
  alwaysVisibleColumns,
  breakpoint,
  onExport,
  onReject,
  onApprove,
  onRevert,
  hidePerPage,
  rowStyle,
  ...props
}: PendingMerchantsDataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { getHeaderGroups, getRowModel, getSelectedRowModel } = table

  const userProfile = useUserProfile()

  const getSelectedMerchantIds = (): number[] => {
    const selectedRows = getSelectedRowModel().rows.map(row => row.original)

    return selectedRows.map(selectedRow => selectedRow.no)
  }

  const handleApprove = () => {
    onApprove(getSelectedMerchantIds())
    setRowSelection({}) // Clear the row selection state to fix undefined error
  }

  const handleReject = () => {
    onReject(getSelectedMerchantIds())
    setRowSelection({}) // Clear the row selection state to fix undefined error
  }

  const handleRevert = () => {
    onRevert(getSelectedMerchantIds())
    setRowSelection({}) // Clear the row selection state to fix undefined error
  }

  return (
    <>
      <HStack spacing='3' mb={{ base: '2', xl: '0' }}>
        <CustomButton px='6' mb='4' isDisabled={data.length === 0} onClick={onExport}>
          Export
        </CustomButton>

        <CustomButton
          px='6'
          mb='4'
          isDisabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onClick={handleReject}
        >
          Reject
        </CustomButton>

        <CustomButton
          px='6'
          mb='4'
          isDisabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onClick={handleApprove}
        >
          Approve
        </CustomButton>

        <CustomButton
          px='6'
          mb='4'
          isDisabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onClick={handleRevert}
        >
          Revert
        </CustomButton>
      </HStack>

      <MobileTable
        table={table}
        alwaysVisibleColumns={alwaysVisibleColumns}
        breakpoint={breakpoint}
      />

      <TableContainer display={{ base: 'none', [breakpoint]: 'block' }} {...props}>
        <Table
          size='sm'
          variant='unstyled'
          style={{ borderCollapse: 'separate', borderSpacing: '0 .5rem' }}
        >
          <Thead>
            {getHeaderGroups()
              // filtering header depth is due to some headers including in both depth 0 and 1
              .filter(headerGroup => headerGroup.depth === 0)
              .map(headerGroup => {
                return (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        <Th
                          key={header.id}
                          colSpan={header.colSpan}
                          textAlign='center'
                          whiteSpace='pre-line'
                          px='3'
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </Th>
                      )
                    })}
                  </Tr>
                )
              })}
          </Thead>

          <Tbody>
            {getRowModel().rows.map(row => (
              <Tr
                key={row.id}
                bg='white'
                opacity={userProfile.data?.id === row.original.maker.id ? '0.7' : ''}
                {...rowStyle}
              >
                {row.getVisibleCells().map(cell => {
                  return (
                    <Td
                      key={cell.id}
                      // Set max width and padding only if the column is accessor type
                      px={cell.column.accessorFn ? '2' : '0'}
                      maxW={cell.column.accessorFn ? '28' : undefined}
                      textAlign='center'
                      whiteSpace='pre-line'
                      lineHeight='shorter'
                      // This is a workaround to set border-radius to table rows
                      _first={{ borderLeftRadius: 'md' }}
                      _last={{ borderRightRadius: 'md' }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext()) ?? '-'}
                    </Td>
                  )
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {data.length > 10 && <PaginationControl table={table} hidePerPage={hidePerPage} />}
    </>
  )
}

export default PendingMerchantsDataTable
