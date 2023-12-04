import { useId } from 'react'
import { type Table } from '@tanstack/react-table'
import {
  Box,
  Flex,
  HStack,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
} from '@chakra-ui/react'
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi'

interface PaginationControlProps<T> {
  table: Table<T>
  totalPages?: number
  hidePerPage?: boolean
}

const PaginationControl = <T,>({
  table,
  totalPages = 1,
  hidePerPage = false,
}: PaginationControlProps<T>) => {
  const id = useId()

  const { setPageIndex, setPageSize, getState, previousPage, nextPage } = table
  const canPreviousPage = getState().pagination.pageIndex === 0
  const canNextPage = getState().pagination.pageIndex === totalPages - 1

  return (
    <HStack
      py='6'
      pr={{ base: '0', md: '4' }}
      justify={{ base: 'space-between', md: 'end' }}
      align='end'
      spacing={{ base: '2', md: '6' }}
      fontSize='sm'
      fontWeight='medium'
    >
      <Flex
        hidden={hidePerPage}
        flexDir={{ base: 'column', md: 'row' }}
        align={{ md: 'center' }}
        gap='2'
      >
        <Box as='label' htmlFor={`${id}-perPage`}>
          Rows per page:
        </Box>
        <Select
          id={`${id}-perPage`}
          w='16'
          size='sm'
          bg='white'
          rounded='md'
          flexShrink='0'
          value={getState().pagination.pageSize}
          /* c8 ignore next 4 */
          onChange={e => {
            const value = e.target.value ? Number(e.target.value) : 0
            setPageSize(value)
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </Select>
      </Flex>

      <HStack display={{ base: 'none', md: 'flex' }}>
        <Box as='label' htmlFor={`${id}-pageNumber`}>
          Go to page:
        </Box>
        <NumberInput
          id={`${id}-pageNumber`}
          w='16'
          size='sm'
          bg='white'
          rounded='md'
          min={1}
          max={totalPages}
          value={getState().pagination.pageIndex + 1}
          onChange={value => setPageIndex(Number(value) - 1)}
        >
          <NumberInputField rounded='md' />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </HStack>

      <HStack>
        <Box minW='100px' pr='2'>
          Page {getState().pagination.pageIndex + 1} of {totalPages}
        </Box>

        <IconButton
          aria-label='Go to the first page'
          icon={<FiChevronsLeft />}
          onClick={() => setPageIndex(0)}
          isDisabled={canPreviousPage}
          size='sm'
          bg='white'
          _hover={{ bg: 'gray.100' }}
        />
        <IconButton
          aria-label='Go to the previous page'
          icon={<FiChevronLeft />}
          onClick={() => previousPage()}
          isDisabled={canPreviousPage}
          size='sm'
          bg='white'
          _hover={{ bg: 'gray.100' }}
        />
        <IconButton
          aria-label='Go to the next page'
          icon={<FiChevronRight />}
          onClick={() => nextPage()}
          isDisabled={canNextPage}
          size='sm'
          bg='white'
          _hover={{ bg: 'gray.100' }}
        />
        <IconButton
          aria-label='Go to the last page'
          icon={<FiChevronsRight />}
          onClick={() => setPageIndex(totalPages - 1)}
          isDisabled={canNextPage}
          size='sm'
          bg='white'
          _hover={{ bg: 'gray.100' }}
        />
      </HStack>
    </HStack>
  )
}

export default PaginationControl
