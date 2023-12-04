import { useState } from 'react'
import { flexRender, type Row } from '@tanstack/react-table'
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  HStack,
  Icon,
  Stack,
} from '@chakra-ui/react'
import { FiMinusCircle, FiPlusCircle } from 'react-icons/fi'

export type Meta = { isConditional: boolean; conditionStatement: string } | undefined

interface MobileTableItemProps<T> {
  row: Row<T>
  // This needs to be an array because additonal action cloumns
  // such as checkboxes can always be displayed
  alwaysVisibleColumns: number[]
}

const MobileTableItem = <T,>({ row, alwaysVisibleColumns }: MobileTableItemProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)

  // This is a workaround to control the toggle state of an accordion
  // as Chakra's interal state can't be controlled directly
  const index = isOpen ? 0 : 1

  return (
    <Accordion index={index} fontSize='sm'>
      <AccordionItem borderWidth='1px' borderColor='gray.200' rounded='md'>
        <Flex
          justify='space-between'
          align='center'
          h='10'
          bg='white'
          pl='4'
          borderTopRadius='md'
          borderBottomRadius={isOpen ? '' : 'md'}
          overflow='hidden'
        >
          <Flex>
            {alwaysVisibleColumns.map(column => (
              <Box key={column} display='inline-block' pr='4'>
                {flexRender(
                  row.getVisibleCells()[column].column.columnDef.cell,
                  row.getVisibleCells()[column].getContext()
                )}
              </Box>
            ))}
          </Flex>

          <AccordionButton
            h='10'
            w='10'
            display='flex'
            justifyContent='center'
            alignItems='center'
            aria-label={`${isOpen ? 'Hide' : 'Show'} table item details`}
            onClick={() => setIsOpen(prevState => !prevState)}
          >
            {isOpen ? <Icon as={FiMinusCircle} /> : <Icon as={FiPlusCircle} />}
          </AccordionButton>
        </Flex>

        <AccordionPanel bg='white' borderBottomRadius='md'>
          <Stack spacing='0'>
            {row.getVisibleCells().map(cell => {
              const header =
                typeof cell.column.columnDef.header === 'string'
                  ? cell.column.columnDef.header
                  : ''

              // This is a workaround to render cells conditionally in mobile table
              let isVisible = true
              const meta = cell.column.columnDef.meta as Meta

              /* c8 ignore next 5 */
              if (meta?.isConditional) {
                isVisible = eval(meta.conditionStatement)
              }

              if (!isVisible) return null

              return (
                <HStack
                  key={cell.id}
                  justify='space-between'
                  p='2'
                  rounded='md'
                  bg={header ? '' : 'transparent !important'}
                  _odd={{ bg: 'gray.100' }}
                >
                  <Box>{header}</Box>
                  <Box>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Box>
                </HStack>
              )
            })}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export default MobileTableItem
