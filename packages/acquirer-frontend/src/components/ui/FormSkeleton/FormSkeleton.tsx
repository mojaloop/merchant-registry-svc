import { Box, SimpleGrid, Skeleton, VStack } from '@chakra-ui/react'

const FormSkeleton = () => {
  return (
    <SimpleGrid
      templateColumns={{
        base: 'repeat(1, 1fr)',
        md: 'repeat(2, 1fr)',
        lg: 'repeat(3, 1fr)',
        xl: 'repeat(4, 1fr)',
      }}
      columnGap='8'
      rowGap={{ base: '4', sm: '6' }}
      justifyItems='center'
      w='full'
    >
      {new Array(8).fill(0).map((_, index) => (
        <VStack key={index} w='full'>
          <Box w='full' maxW={{ md: '20rem' }}>
            <Skeleton h='3' w='10' mb='2' rounded='md' />
          </Box>
          <Skeleton h='10' w='full' maxW={{ md: '20rem' }} rounded='md' />
        </VStack>
      ))}
    </SimpleGrid>
  )
}

export default FormSkeleton
