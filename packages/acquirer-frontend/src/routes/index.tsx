import { useEffect, useState } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import { PortalUserType } from 'shared-lib'

import { getUserProfile } from '@/api/users'
import { Layout } from '@/components/layout'
import {
  AddNewUser,
  AliasGeneratedMerchantRecords,
  AllMerchantRecords,
  AuditLog,
  DraftApplications,
  ForgotPassword,
  Login,
  Dfsps,
  OnboardDfsp,
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
  const [redirectTarget, setRedirectTarget] = useState('/registry')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!localStorage.getItem('token')) {
          setIsLoading(false)
          return
        }

        const userProfile = await getUserProfile()
        if (userProfile.user_type === PortalUserType.HUB) {
          setRedirectTarget('/portal-user-management/user-management')
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [redirectTarget])

  const element = useRoutes([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Navigate to={redirectTarget} replace />,
        },
        {
          path: 'onboarding-dfsp',
          element: <OnboardDfsp />,
          caseSensitive: true,
        },
        {
          path: 'dfsp-list',
          element: <Dfsps />,
          caseSensitive: true,
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
          path: 'merchant-records/alias-generated-merchant-records',
          element: <AliasGeneratedMerchantRecords />,
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
        {
          path: 'audit-log',
          element: <AuditLog />,
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
    {
      path: '/forgot-password',
      element: <ForgotPassword />,
      caseSensitive: true,
    },
  ])
  if (isLoading) {
    return <div></div>
  }
  return element
}

export default Routes
