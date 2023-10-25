import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { DrawerDisclosureProvider, NavItemsProvider } from '@/contexts'

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <NavItemsProvider>
          <DrawerDisclosureProvider>{children}</DrawerDisclosureProvider>
        </NavItemsProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default TestWrapper
