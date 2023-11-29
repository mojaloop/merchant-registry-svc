import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  ChakraProvider,
  createStandaloneToast,
  type UseToastOptions,
} from '@chakra-ui/react'
import { isAxiosError } from 'axios'

import theme from '@/theme'
import { DrawerDisclosureProvider, NavItemsProvider } from '@/contexts'
import App from './App.tsx'

import './index.css'

const { ToastContainer, toast } = createStandaloneToast(theme)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
  // https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (isAxiosError(error) && query.meta?.toastTitle && query.meta?.toastStatus) {
        toast({
          title: (query.meta.toastTitle as string) || '',
          description: error.response?.data.message || query.meta?.toastDescription,
          status: query.meta.toastStatus as UseToastOptions['status'],
          variant: 'subtle',
          position: 'top',
          isClosable: true,
        })
      }
    },
  }),
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <BrowserRouter>
        <ChakraProvider
          theme={theme}
          toastOptions={{
            defaultOptions: { variant: 'subtle', position: 'top', isClosable: true },
          }}
        >
          <NavItemsProvider>
            <DrawerDisclosureProvider>
              <ToastContainer />
              <App />
            </DrawerDisclosureProvider>
          </NavItemsProvider>
        </ChakraProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
