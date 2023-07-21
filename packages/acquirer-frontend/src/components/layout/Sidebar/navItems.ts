import { type IconType } from 'react-icons'
import { MdAssignmentAdd } from 'react-icons/md'
import { TbFileText, TbUserSearch } from 'react-icons/tb'

export interface SubNavItem {
  name: string
  tooltipLabel: string
  to: string
}

export interface NavAccordion {
  tooltipLabel: string
  label: string
  icon: IconType
  subNavItems: SubNavItem[]
}

export const navItems = [
  {
    tooltipLabel: 'Registry',
    to: '/registry',
    label: 'Go to registry page',
    icon: MdAssignmentAdd,
  },
  {
    tooltipLabel: 'Merchant Records',
    label: 'Open merchant records nav menu',
    icon: TbFileText,
    subNavItems: [
      {
        name: 'All',
        tooltipLabel: 'All Merchant Records',
        to: '/merchant-records/all-merchant-records',
      },
      {
        name: 'Pending',
        tooltipLabel: 'Pending Merchant Records',
        to: '/merchant-records/pending-merchant-records',
      },
    ],
  },
  {
    tooltipLabel: 'Portal User Management',
    label: 'Open portal user management nav menu',
    icon: TbUserSearch,
    subNavItems: [
      {
        name: 'Role',
        tooltipLabel: 'Role Management',
        to: '/portal-user-management/role-management',
      },
      {
        name: 'User',
        tooltipLabel: 'User Management',
        to: '/portal-user-management/user-management',
      },
    ],
  },
]
