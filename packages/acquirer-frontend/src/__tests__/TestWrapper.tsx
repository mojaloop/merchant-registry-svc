import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider } from '@chakra-ui/react'

import { DrawerDisclosureProvider, NavItemsProvider } from '@/contexts'
import theme from '@/theme'

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <ChakraProvider
          theme={theme}
          toastOptions={{
            defaultOptions: { variant: 'subtle', position: 'top', isClosable: true },
          }}
        >
          <NavItemsProvider>
            <DrawerDisclosureProvider>{children}</DrawerDisclosureProvider>
          </NavItemsProvider>
        </ChakraProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default TestWrapper
