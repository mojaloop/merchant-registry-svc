import { Image, StackProps, Text, VStack } from '@chakra-ui/react'

import emptyData from './empty-data.svg'

interface EmptyStateProps extends StackProps {
  text: string
}

const EmptyState = ({ text, ...props }: EmptyStateProps) => {
  /* c8 ignore next 10 */
  return (
    <VStack textAlign='center' {...props}>
      <Image src={emptyData} w='16' />

      <Text fontSize='16px' mt='2' fontWeight='semibold'>
        {text}
      </Text>
    </VStack>
  )
}

export default EmptyState
