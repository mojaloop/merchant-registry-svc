import type { DraftData } from '@/types/form'
import instance from '@/lib/axiosInstance'

export const getDraftData = async (merchantId: string) => {
  const token = sessionStorage.getItem('token')
  if (!token) {
    alert('You are not logged in!')
    return
  }

  try {
    return await instance.get<{ data: DraftData }>(`/merchants/${merchantId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.log(error)
  }
}
