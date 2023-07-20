import { Navigate, useRoutes } from 'react-router-dom'

import { Layout } from '@/components/layout'
import {
  AllMerchantRecords,
  PendingMerchantRecords,
  Registry,
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
          element: <Registry />,
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
  ])

  return element
}

export default Routes
