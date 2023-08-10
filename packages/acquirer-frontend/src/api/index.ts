import type { DraftData } from '@/types/form'
import instance from '@/lib/axiosInstance'

export const getDraftData = async (merchantId: string) => {
  try {
    return await instance.get<{ data: DraftData }>(`/merchants/${merchantId}`)
  } catch (error) {
    console.log(error)
  }
}
