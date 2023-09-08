import { type IconType } from 'react-icons'

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
