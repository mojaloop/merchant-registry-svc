import { Outlet } from 'react-router-dom'
import { Box, Flex, Stack } from '@chakra-ui/react'

import { Header, Sidebar } from '@/components/layout'

const Layout = () => {
  return (
    <Stack spacing='0'>
      <Header />

      <Flex h='100vh'>
        <Sidebar />

        <Box
          position={'relative'}
          as='main'
          ml={{ base: '0', md: '24' }}
          mt='12'
          px={{ base: '4', sm: '6', lg: '8' }}
          py='6'
          w={{ base: 'full', md: 'calc(100vw - 6rem)' }}
          overflow='scroll'
        >
          <Outlet />
        </Box>
      </Flex>
    </Stack>
  )
}

export default Layout
