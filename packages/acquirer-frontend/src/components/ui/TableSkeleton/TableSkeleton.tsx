import { Skeleton, type StackProps, VStack } from '@chakra-ui/react'

interface TableSkeletonProps extends StackProps {
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const TableSkeleton = ({ breakpoint, ...props }: TableSkeletonProps) => {
  const arr = new Array(10).fill(0)

  return (
    <VStack {...props}>
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
