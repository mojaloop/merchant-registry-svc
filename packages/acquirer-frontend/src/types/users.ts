import type { PortalUserStatus, PortalUserType } from 'shared-lib'

import type { Role } from './roles'

export interface User {
  no: number
  name: string
  email: string
  role: string
}

export type UsersResponse = {
  id: number
  name: string
  email: string
  phone_number: string
  role: Role
  status: PortalUserStatus
  user_type: PortalUserType
  created_at: string
  updated_at: string
}[]
