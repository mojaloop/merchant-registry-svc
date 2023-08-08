import { Navigate, useRoutes } from 'react-router-dom'

import DraftDataProvider from '@/context/DraftDataContext'
import { Layout } from '@/components/layout'
import {
  AllMerchantRecords,
  Login,
  PendingMerchantRecords,
  Registry,
  RegistryForm,
  RoleManagement,
  UserManagement,
} from '@/pages'

const Routes = () => {
  const element = useRoutes([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Navigate to='/registry' replace />,
        },
        {
          path: 'registry',
          element: (
            <DraftDataProvider>
              <Registry />
            </DraftDataProvider>
          ),
          caseSensitive: true,
        },
        {
          path: 'registry/registry-form',
          element: (
            <DraftDataProvider>
              <RegistryForm />
            </DraftDataProvider>
          ),
          caseSensitive: true,
        },
        {
          path: 'merchant-records/all-merchant-records',
          element: <AllMerchantRecords />,
          caseSensitive: true,
        },
        {
          path: 'merchant-records/pending-merchant-records',
          element: <PendingMerchantRecords />,
          caseSensitive: true,
        },
        {
          path: 'portal-user-management/role-management',
          element: <RoleManagement />,
          caseSensitive: true,
        },
        {
          path: 'portal-user-management/user-management',
          element: <UserManagement />,
          caseSensitive: true,
        },
      ],
    },
    {
      path: '/login',
      element: <Login />,
      caseSensitive: true,
    },
  ])

  return element
}

export default Routes
