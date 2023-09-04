import type { RolesResponse } from '@/types/roles'
import instance from '@/lib/axiosInstance'

export async function getRoles() {
  const response = await instance.get<RolesResponse>('/roles')
  return response.data
}
