import { Navigate, useRoutes } from 'react-router-dom'

import { Layout } from '@/components/layout'
import {
  AddNewUser,
  AllMerchantRecords,
  ApprovedMerchantRecords,
  DraftApplications,
  Login,
  PendingMerchantRecords,
  Registry,
  RegistryForm,
  RejectedMerchantRecords,
  RevertedMerchantRecords,
  RoleManagement,
  SetPassword,
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
          path: 'registry/draft-applications',
          element: <DraftApplications />,
          caseSensitive: true,
        },
        {
          path: 'registry/registry-form',
          element: <RegistryForm />,
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
          path: 'merchant-records/reverted-merchant-records',
          element: <RevertedMerchantRecords />,
          caseSensitive: true,
        },
        {
          path: 'merchant-records/rejected-merchant-records',
          element: <RejectedMerchantRecords />,
          caseSensitive: true,
        },
        {
          path: 'merchant-records/approved-merchant-records',
          element: <ApprovedMerchantRecords />,
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
        {
          path: 'portal-user-management/user-management/add-new-user',
          element: <AddNewUser />,
          caseSensitive: true,
        },
      ],
    },
    {
      path: '/login',
      element: <Login />,
      caseSensitive: true,
    },
    {
      path: '/set-password',
      element: <SetPassword />,
      caseSensitive: true,
    },
  ])

  return element
}

export default Routes
