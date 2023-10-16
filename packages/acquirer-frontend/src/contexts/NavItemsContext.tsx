import { getUserProfile } from '@/api/users'
import { createContext, useContext, useEffect, useState } from 'react'
import { AiOutlineAudit } from 'react-icons/ai'
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
        name: 'Alias Generated Merchant Records',
        shortName: 'Alias Generated',
        to: '/merchant-records/alias-generated-merchant-records',
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
  {
    name: 'Audit Log',
    to: '/audit-log',
    label: 'Go to audit log page',
    icon: AiOutlineAudit,
  },
]

export const RESTRICTED_ROUTE_NAMES = ['Portal User Management', 'Audit Log']

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

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    getUserProfile().then(userProfile => {
      // Remove portal user management from sidebar if the user is operator or auditor
      if (
        userProfile.role.name === 'DFSP Operator' ||
        userProfile.role.name === 'DFSP Auditor'
      ) {
        const navItems = NAV_ITEMS.filter(
          navItem => !RESTRICTED_ROUTE_NAMES.includes(navItem.name)
        )
        setNavItems(navItems)
      } else {
        setNavItems(NAV_ITEMS)
      }
    })
  }, [])

  return (
    <NavItemsContext.Provider value={{ navItems, setNavItems }}>
      {children}
    </NavItemsContext.Provider>
  )
}

export default NavItemsProvider
