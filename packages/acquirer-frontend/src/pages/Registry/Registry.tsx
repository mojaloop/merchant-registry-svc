import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Heading, Link, Text } from '@chakra-ui/react'

import { getDraftCount } from '@/api'
import { CustomButton, CustomLink } from '@/components/ui'

const Registry = () => {
  const navigate = useNavigate()

  const [draftCount, setDraftCount] = useState<number>(0)

  useEffect(() => {
    getDraftCount().then(data => {
      if (data) {
        setDraftCount(data)
      }
    })
  }, [])

  return (
    <Box>
      <Heading size='md' mb='10'>
        Merchant Acquiring System
      </Heading>

      <Heading as='h3' size='sm' fontWeight='medium' mb='5'>
        Fill in the merchant registry form
      </Heading>

      <CustomLink
        href='/registry/registry-form'
        mr='4'
        onClick={() => {
          sessionStorage.removeItem('merchantId')
        }}
      >
        Add new record
      </CustomLink>

      <Box position='relative' display='inline-block'>
        <CustomLink
          isDisabled={draftCount === 0}
          onClick={() => navigate('/registry/draft-applications')}
        >
          Continue with saved draft
        </CustomLink>

        {draftCount > 0 && (
          <Box
            as='span'
            w='6'
            h='6'
            position='absolute'
            top='-3'
            right='-2.5'
            display='flex'
            justifyContent='center'
            alignItems='center'
            bg='accent'
            color='white'
            fontSize='0.65rem'
            fontWeight='bold'
            rounded='full'
            borderWidth='0.8px'
            borderColor='secondary'
            shadow='md'
          >
            {draftCount}
          </Box>
        )}
      </Box>

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
          Sample merchant record file template
        </Link>
      </Box>
    </Box>
  )
}

export default Registry
