import { isAxiosError } from 'axios'
import { MerchantRegistrationStatus } from 'shared-lib'

import type { DraftData } from '@/types/form'
import type { MerchantRecord } from '@/types/merchants'
import instance from '@/lib/axiosInstance'
import type { AllMerchants } from '@/lib/validations/allMerchants'
import type { PendingMerchants } from '@/lib/validations/pendingMerchants'

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
    if (isAxiosError(error)) {
      alert(error.response?.data?.message)
    }
  }
}

export const getMerchants = async (params: AllMerchants | PendingMerchants) => {
  try {
    const response = await instance.get<{ data: MerchantRecord[] }>('/merchants', {
      params,
    })

    return response.data.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(error.response?.data?.message)
    }
  }
}

export const approveMerchants = async (selectedMerchantIds: number[]) => {
  try {
    await instance.put('/merchants/registration-status', {
      ids: selectedMerchantIds,
      registration_status: MerchantRegistrationStatus.APPROVED,
    })
  } catch (error) {
    if (isAxiosError(error)) {
      alert(error.response?.data?.message)
    }
  }
}

export const rejectMerchants = async (selectedMerchantIds: number[]) => {
  try {
    await instance.put('/merchants/registration-status', {
      ids: selectedMerchantIds,
      registration_status: MerchantRegistrationStatus.REJECTED,
    })
  } catch (error) {
    if (isAxiosError(error)) {
      alert(error.response?.data?.message)
    }
  }
}
