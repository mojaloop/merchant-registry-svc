import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Heading, Link, Text } from '@chakra-ui/react'

import { getDraftData } from '@/api'
import { useDraftData } from '@/context/DraftDataContext'
import { CustomButton } from '@/components/ui'

const Registry = () => {
  const navigate = useNavigate()

  const { draftData, setDraftData } = useDraftData()

  useEffect(() => {
    const merchantId = sessionStorage.getItem('merchantId')
    if (!merchantId) return

    getDraftData(merchantId).then(res => setDraftData(res?.data?.data ?? null))
  }, [setDraftData])

  return (
    <Box>
      <Heading size='md' mb='10'>
        Merchant Acquiring System
      </Heading>

      <Heading as='h3' size='sm' fontWeight='medium' mb='5'>
        Fill in the merchant registry form
      </Heading>

      <CustomButton mr='4' onClick={() => navigate('/registry/registry-form')}>
        Add new record
      </CustomButton>
      <CustomButton
        isDisabled={!draftData}
        onClick={() => navigate('/registry/registry-form?draft=true')}
      >
        Continue with saved draft
      </CustomButton>

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
