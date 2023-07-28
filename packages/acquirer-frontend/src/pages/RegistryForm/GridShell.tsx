import { SimpleGrid, type GridItemProps } from '@chakra-ui/react'

const GridShell = ({ children, ...props }: GridItemProps) => {
  return (
    <SimpleGrid
      templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
      rowGap={{ base: '4', sm: '6' }}
      pb={{ base: '4', sm: '6' }}
      {...props}
    >
      {children}
    </SimpleGrid>
  )
}

export default GridShell
