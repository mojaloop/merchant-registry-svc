export interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
}

export interface RolesResponse {
  data: Role[]
  message: string
  permissions: string[]
}
