import { HStack, Skeleton, VStack } from '@chakra-ui/react'

interface TableSkeletonProps {
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const TableSkeleton = ({ breakpoint }: TableSkeletonProps) => {
  const arr = new Array(10).fill(0)

  return (
    <>
      <HStack spacing='8' display={{ base: 'none', [breakpoint]: 'flex' }} mt='2'>
        {arr.map((_, index) => (
          <Skeleton key={`header-${index}`} h='6' w='20' rounded='md' />
        ))}
      </HStack>

      <Skeleton
        display={{ base: 'block', [breakpoint]: 'none' }}
        h='5'
        w='20'
        mt='2'
        rounded='md'
      />

      <VStack mt={{ base: '3', [breakpoint]: '6' }}>
        {arr.map((_, index) => (
          <Skeleton
            key={`row-${index}`}
            h={{ base: '8', [breakpoint]: '10' }}
            w='full'
            rounded='md'
          />
        ))}
      </VStack>
    </>
  )
}

export default TableSkeleton
