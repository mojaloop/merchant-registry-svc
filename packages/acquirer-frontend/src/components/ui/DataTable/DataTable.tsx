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
} from '@chakra-ui/react'

import MobileTable from './MobileTable'
import PaginationControl from './PaginationControl'

interface DataTableProps<T> extends TableContainerProps {
  data: T[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[]
  alwaysVisibleColumns: number[]
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  hidePerPage?: boolean
  rowStyle?: TableRowProps
}

const DataTable = <T,>({
  data,
  columns,
  alwaysVisibleColumns,
  breakpoint,
  hidePerPage,
  rowStyle,
  ...props
}: DataTableProps<T>) => {
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

  const { getHeaderGroups, getRowModel } = table

  return (
    <>
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
              <Tr key={row.id} bg='white' {...rowStyle}>
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

export default DataTable
