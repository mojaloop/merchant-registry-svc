import { createContext, useContext, useEffect, useState } from 'react'
import { AiOutlineAudit } from 'react-icons/ai'
import { MdAssignmentAdd } from 'react-icons/md'
import { RiShieldUserLine } from 'react-icons/ri'
import { TbFileText, TbUserSearch } from 'react-icons/tb'

import { getUserProfile } from '@/api/users'

export const NAV_ITEMS = [
  {
    name: 'Onboarding DFSP',
    to: '/onboarding-dfsp',
    label: 'go to onboarding dfsp page',
    icon: MdAssignmentAdd,
    permissions: ['Create DFSPs'],
  },
  {
    name: 'DFSP List',
    to: '/dfsp-list',
    label: 'go to dfsp list page',
    icon: RiShieldUserLine,
    permissions: ['View DFSPs']
  },
  {
    name: 'Registry',
    to: '/registry',
    label: 'Go to registry page',
    icon: MdAssignmentAdd,
    permissions: ['Create Merchants'],
  },
  {
    name: 'Merchant Records',
    label: 'Open merchant records nav menu',
    icon: TbFileText,
    permissions: ['View Merchants'],
    subNavItems: [
      {
        name: 'All Merchant Records',
        shortName: 'All',
        to: '/merchant-records/all-merchant-records',
        permissions: ['View Merchants'],
      },
      {
        name: 'Pending Merchant Records',
        shortName: 'Pending',
        to: '/merchant-records/pending-merchant-records',
        permissions: ['View Merchants'],
      },
      {
        name: 'Reverted Merchant Records',
        shortName: 'Reverted',
        to: '/merchant-records/reverted-merchant-records',
        permissions: ['View Merchants'],
      },
      {
        name: 'Rejected Merchant Records',
        shortName: 'Rejected',
        to: '/merchant-records/rejected-merchant-records',
        permissions: ['View Merchants'],
      },
      {
        name: 'Alias Generated Merchant Records',
        shortName: 'Alias Generated',
        to: '/merchant-records/alias-generated-merchant-records',
        permissions: ['View Merchants'],
      },
    ],
  },
  {
    name: 'Portal User Management',
    label: 'Open portal user management nav menu',
    icon: TbUserSearch,
    permissions: ['View Portal Users'],
    subNavItems: [
      {
        name: 'Role Management',
        shortName: 'Role',
        to: '/portal-user-management/role-management',
        permissions: ['View Roles'],
      },
      {
        name: 'User Management',
        shortName: 'User',
        to: '/portal-user-management/user-management',
        permissions: ['View Portal Users'],
      },
    ],
  },
  {
    name: 'Audit Log',
    to: '/audit-log',
    label: 'Go to audit log page',
    icon: AiOutlineAudit,
    permissions: ['View Audit Logs'],
  },
]

interface NavItemsContextProps {
  navItems: typeof NAV_ITEMS
  setNavItems: React.Dispatch<React.SetStateAction<typeof NAV_ITEMS>>
}

export const NavItemsContext = createContext<NavItemsContextProps | null>(null)

export const useNavItems = () => {
  const context = useContext(NavItemsContext)

  if (!context) {
    throw new Error('`useNavItems` hook must be called inside `NavItemsProvider`')
  }

  return context
}

const NavItemsProvider = ({ children }: { children: React.ReactNode }) => {
  const [navItems, setNavItems] = useState(NAV_ITEMS)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    getUserProfile().then(userProfile => {
      // Remove navigation item from sidebar if the user doesn't have the required permissions
      const userPermissions = userProfile?.role?.permissions || []

      const filteredNavItems = NAV_ITEMS.map(navItem => {
        // Copy the navItem to avoid mutating the original
        const newItem = { ...navItem }

        if (newItem.subNavItems) {
          newItem.subNavItems = newItem.subNavItems.filter(subNavItem => {
            return subNavItem.permissions
              ? subNavItem.permissions.some(permission =>
                  userPermissions.includes(permission)
                )
              : true
          })
        }

        // Check the main navItem
        if (
          newItem.permissions &&
          !newItem.permissions.some(permission => userPermissions.includes(permission))
        ) {
          return null // Exclude the main navItem if user lacks permissions
        }

        return newItem
      }).filter(item => item !== null) // Remove null items

      setNavItems(filteredNavItems as typeof NAV_ITEMS)
    })
  }, [])

  return (
    <NavItemsContext.Provider value={{ navItems, setNavItems }}>
      {children}
    </NavItemsContext.Provider>
  )
}

export default NavItemsProvider
