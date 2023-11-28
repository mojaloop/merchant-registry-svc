import { flexRender, type Table } from '@tanstack/react-table'
import { Box, Flex, Stack } from '@chakra-ui/react'

import MobileTableItem from './MobileTableItem'

interface MobileTableProps<T> {
  table: Table<T>
  alwaysVisibleColumns: number[]
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const MobileTable = <T,>({
  table,
  alwaysVisibleColumns,
  breakpoint,
}: MobileTableProps<T>) => {
  const headers = table.getFlatHeaders()

  return (
    <Box display={{ base: 'block', [breakpoint]: 'none' }}>
      <Flex pl='4' mb='2'>
        {alwaysVisibleColumns.map(column => (
          <Box
            key={column}
            pr='4'
            fontSize='xs'
            fontWeight='bold'
            letterSpacing='wider'
            textTransform='uppercase'
          >
            {flexRender(
              headers[column].column.columnDef.header,
              headers[column].getContext()
            )}
          </Box>
        ))}
      </Flex>

      <Stack>
        {table.getRowModel().rows.map(row => (
          <MobileTableItem
            key={row.id}
            row={row}
            alwaysVisibleColumns={alwaysVisibleColumns}
          />
        ))}
      </Stack>
    </Box>
  )
}

export default MobileTable
