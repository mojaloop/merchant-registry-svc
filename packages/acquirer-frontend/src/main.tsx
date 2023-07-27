import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'

import theme from '@/theme'
import DrawerDisclosureProvider from '@/context/DrawerDisclosureContext.tsx'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <DrawerDisclosureProvider>
          <App />
        </DrawerDisclosureProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
)
