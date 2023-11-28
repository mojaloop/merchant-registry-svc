import { VStack, type StackProps } from '@chakra-ui/react'

import { Skeleton } from '@/components/ui'

interface TableSkeletonProps extends StackProps {
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const TableSkeleton = ({ breakpoint, ...props }: TableSkeletonProps) => {
  const arr = new Array(10).fill(0)

  return (
    <VStack {...props} data-testid='table-skeleton'>
      {arr.map((_, index) => (
        <Skeleton
          key={`row-${index}`}
          h={{ base: '8', [breakpoint]: '10' }}
          w='full'
          rounded='md'
        />
      ))}
    </VStack>
  )
}

export default TableSkeleton
