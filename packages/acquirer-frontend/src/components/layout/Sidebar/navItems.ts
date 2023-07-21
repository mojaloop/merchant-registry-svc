import { type IconType } from 'react-icons'
import { MdAssignmentAdd } from 'react-icons/md'
import { TbFileText, TbUserSearch } from 'react-icons/tb'

export interface NavItem {
  name: string
  to: string
  label?: string
  icon?: IconType
}

export interface SubNavItem {
  name: string
  shortName: string
  to: string
}

export interface NavAccordion {
  name: string
  label: string
  icon: IconType
  subNavItems: SubNavItem[]
}

export const navItems = [
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
