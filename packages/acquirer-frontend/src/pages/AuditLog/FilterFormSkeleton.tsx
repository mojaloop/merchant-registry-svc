import { Box, Flex, HStack, VStack } from '@chakra-ui/react'

import { Skeleton } from '@/components/ui'

const FilterFormSkeleton = () => {
  return (
    <Flex flexDir={{ base: 'column', md: 'row' }} gap='8' data-testid='form-skeleton'>
      <VStack w={{ base: 'full', md: '20rem' }}>
        <Box w='full' maxW={{ base: 'full', md: '20rem' }}>
          <Skeleton h='3' w='10' rounded='md' />
        </Box>
        <Skeleton h='10' w='full' maxW={{ base: 'full', md: '20rem' }} rounded='md' />
      </VStack>

      <VStack w={{ base: 'full', md: '20rem' }}>
        <Box w='full' maxW={{ base: 'full', md: '20rem' }}>
          <Skeleton h='3' w='10' rounded='md' />
        </Box>
        <Skeleton h='10' w='full' maxW={{ base: 'full', md: '20rem' }} rounded='md' />
      </VStack>

      <HStack alignSelf='end' gap='3'>
        <Skeleton h='8' w='20' mb='1' rounded='md' />

        <Skeleton h='8' w='20' mb='1' rounded='md' />
      </HStack>
    </Flex>
  )
}

export default FilterFormSkeleton
