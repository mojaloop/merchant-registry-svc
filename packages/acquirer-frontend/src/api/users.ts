import type { UsersResponse } from '@/types/users'
import instance from '@/lib/axiosInstance'

export async function getUsers() {
  const response = await instance.get<{ data: UsersResponse }>('/users')
  return response.data.data
}
