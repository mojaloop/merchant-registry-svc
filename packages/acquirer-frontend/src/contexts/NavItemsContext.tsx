import { createContext, useContext, useState } from 'react'

import { MdAssignmentAdd } from 'react-icons/md'
import { TbFileText, TbUserSearch } from 'react-icons/tb'

export const NAV_ITEMS = [
  {
    name: 'Registry',
    to: '/registry',
    label: 'Go to registry page',
    icon: MdAssignmentAdd,
  },
  {
    name: 'Merchant Records',
    label: 'Open merchant records nav menu',
    icon: TbFileText,
    subNavItems: [
      {
        name: 'All Merchant Records',
        shortName: 'All',
        to: '/merchant-records/all-merchant-records',
      },
      {
        name: 'Pending Merchant Records',
        shortName: 'Pending',
        to: '/merchant-records/pending-merchant-records',
      },
      {
        name: 'Reverted Merchant Records',
        shortName: 'Reverted',
        to: '/merchant-records/reverted-merchant-records',
      },
      {
        name: 'Rejected Merchant Records',
        shortName: 'Rejected',
        to: '/merchant-records/rejected-merchant-records',
      },
      {
        name: 'Approved Merchant Records',
        shortName: 'Approved',
        to: '/merchant-records/approved-merchant-records',
      },
    ],
  },
  {
    name: 'Portal User Management',
    label: 'Open portal user management nav menu',
    icon: TbUserSearch,
    subNavItems: [
      {
        name: 'Role Management',
        shortName: 'Role',

        to: '/portal-user-management/role-management',
      },
      {
        name: 'User Management',
        shortName: 'User',
        to: '/portal-user-management/user-management',
      },
    ],
  },
]

interface NavItemsContextProps {
  navItems: typeof NAV_ITEMS
  setNavItems: React.Dispatch<React.SetStateAction<typeof NAV_ITEMS>>
}

const NavItemsContext = createContext<NavItemsContextProps | null>(null)

export const useNavItems = () => {
  const context = useContext(NavItemsContext)

  if (!context) {
    throw new Error('`useNavItems` hook must be called inside `NavItemsProvider`')
  }

  return context
}

const NavItemsProvider = ({ children }: { children: React.ReactNode }) => {
  const [navItems, setNavItems] = useState(NAV_ITEMS)

  return (
    <NavItemsContext.Provider value={{ navItems, setNavItems }}>
      {children}
    </NavItemsContext.Provider>
  )
}

export default NavItemsProvider
