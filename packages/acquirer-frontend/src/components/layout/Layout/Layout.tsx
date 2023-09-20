import { Navigate, Outlet } from 'react-router-dom'
import { Box, Flex, Stack } from '@chakra-ui/react'

import { isTokenExpired } from '@/utils'
import { Header, Sidebar } from '@/components/layout'

const Layout = () => {
  const token = sessionStorage.getItem('token')
  if (!token) return <Navigate to='/login' replace />

  if (isTokenExpired(token)) return <Navigate to='/login' replace />

  return (
    <Stack spacing='0'>
      <Header />

      <Flex h='100vh'>
        <Sidebar />

        <Box
          id='main'
          position='relative'
          as='main'
          ml={{ base: '0', lg: '24' }}
          mt='14'
          w={{ base: 'full', lg: 'calc(100vw - 6rem)' }}
          overflow='scroll'
        >
          <Outlet />
        </Box>
      </Flex>
    </Stack>
  )
}

export default Layout
