import { Box, Heading, Link, Text } from '@chakra-ui/react'

import { CustomButton } from '@/components/ui'

const Registry = () => {
  return (
    <Box>
      <Heading size='lg' mb='10'>
        Merchant Registration
      </Heading>

      <Heading as='h3' size='sm' fontWeight='medium' mb='5'>
        Fill in the merchant registry form
      </Heading>

      <CustomButton mr='4'>Add new record</CustomButton>
      <CustomButton isDisabled>Continue with saved draft</CustomButton>

      <Heading as='h3' size='sm' fontWeight='medium' mt='10' mb='5'>
        Import bulk record file
      </Heading>

      <CustomButton>Choose a file</CustomButton>

      <Box mt='6'>
        <Text mb='1.5' fontSize='sm'>
          Download sample files here.
        </Text>

        <Link
          download
          href='https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?cs=srgb&dl=pexels-pixabay-268533.jpg&fm=jpg'
          color='blue.500'
          fontSize='sm'
        >
          Sample merchant record file type
        </Link>
      </Box>
    </Box>
  )
}

export default Registry
