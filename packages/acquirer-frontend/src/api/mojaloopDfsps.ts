import type { mojaloopDfspsResponse } from '@/types/mojaloopDfsps'
import instance from '@/lib/axiosInstance'

export async function getMojaloopDfsps() {
  const response = await instance.get<mojaloopDfspsResponse>('/mojaloop-dfsps')
  return response.data
}
