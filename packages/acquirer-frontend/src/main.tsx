import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  ChakraProvider,
  type UseToastOptions,
  createStandaloneToast,
} from '@chakra-ui/react'
import { isAxiosError } from 'axios'

import theme from '@/theme'
import DrawerDisclosureProvider from '@/context/DrawerDisclosureContext.tsx'
import App from './App.tsx'
import './index.css'

const { toast } = createStandaloneToast()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (isAxiosError(error)) {
        toast({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          title: (query.meta!.toastTitle as string) || '',
          description: error.response?.data.message || query.meta?.toastDescription,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          status: query.meta!.toastStatus as UseToastOptions['status'],
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
        <ChakraProvider theme={theme}>
          <DrawerDisclosureProvider>
            <App />
          </DrawerDisclosureProvider>
        </ChakraProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
