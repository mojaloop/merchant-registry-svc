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
  hidePerPage?: boolean
}

const PaginationControl = <T,>({
  table,
  hidePerPage = false,
}: PaginationControlProps<T>) => {
  const id = useId()

  const {
    setPageIndex,
    setPageSize,
    getState,
    getPageCount,
    getCanPreviousPage,
    getCanNextPage,
    previousPage,
    nextPage,
  } = table

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
          max={getPageCount()}
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
          Page {getState().pagination.pageIndex + 1} of {getPageCount()}
        </Box>

        <IconButton
          aria-label='Go to the first page'
          icon={<FiChevronsLeft />}
          onClick={() => setPageIndex(0)}
          isDisabled={!getCanPreviousPage()}
          size='sm'
          bg='white'
          _hover={{ bg: 'gray.100' }}
        />
        <IconButton
          aria-label='Go to the previous page'
          icon={<FiChevronLeft />}
          onClick={() => previousPage()}
          isDisabled={!getCanPreviousPage()}
          size='sm'
          bg='white'
          _hover={{ bg: 'gray.100' }}
        />
        <IconButton
          aria-label='Go to the next page'
          icon={<FiChevronRight />}
          onClick={() => nextPage()}
          isDisabled={!getCanNextPage()}
          size='sm'
          bg='white'
          _hover={{ bg: 'gray.100' }}
        />
        <IconButton
          aria-label='Go to the last page'
          icon={<FiChevronsRight />}
          onClick={() => setPageIndex(getPageCount() - 1)}
          isDisabled={!getCanNextPage()}
          size='sm'
          bg='white'
          _hover={{ bg: 'gray.100' }}
        />
      </HStack>
    </HStack>
  )
}

export default PaginationControl
