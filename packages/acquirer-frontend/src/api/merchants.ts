import { isAxiosError } from 'axios'

import type { MerchantDetails } from '@/types/merchantDetails'
import instance from '@/lib/axiosInstance'
import type { MerchantsFilterForm } from '@/lib/validations/merchantsFilter'
import type { AllMerchantsFilterForm } from '@/lib/validations/allMerchantsFilter'

export async function getMerchants(params: AllMerchantsFilterForm | MerchantsFilterForm) {
  const response = await instance.get<{ data: MerchantDetails[] }>('/merchants', {
    params,
  })

  return response.data.data
}

export async function getMerchant(merchantId: number) {
  const response = await instance.get<{ data: MerchantDetails }>(
    `/merchants/${merchantId}`
  )

  return response.data.data
}

export async function approveMerchants(selectedMerchantIds: number[]) {
  try {
    await instance.put('/merchants/bulk-approve', {
      ids: selectedMerchantIds,
    })
  } catch (error) {
    if (isAxiosError(error)) {
      alert(error.response?.data?.message)
    }
  }
}

export async function rejectMerchants(selectedMerchantIds: number[], reason: string) {
  try {
    await instance.put('/merchants/bulk-reject', {
      ids: selectedMerchantIds,
      reason,
    })
  } catch (error) {
    if (isAxiosError(error)) {
      alert(error.response?.data?.message)
    }
  }
}

export async function revertMerchants(selectedMerchantIds: number[], reason: string) {
  try {
    await instance.put('/merchants/bulk-revert', {
      ids: selectedMerchantIds,
      reason,
    })
  } catch (error) {
    if (isAxiosError(error)) {
      alert(error.response?.data?.message)
    }
  }
}

export async function exportMerchants(
  params: AllMerchantsFilterForm | MerchantsFilterForm
) {
  try {
    const response = await instance.get<Blob>(`/merchants/export-with-filter`, {
      params,
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(error.response?.data?.message)
    }
  }
}
