import { isAxiosError } from 'axios'

import type { FormReponse } from '@/types/form'
import type { MerchantDetails } from '@/types/merchantDetails'
import instance from '@/lib/axiosInstance'
import type {
  BusinessInfoForm,
  ContactPersonForm,
  LocationInfoForm,
  OwnerInfoForm,
} from '@/lib/validations/registry'
import type { MerchantsFilterForm } from '@/lib/validations/merchantsFilter'
import type { AllMerchantsForm } from '@/lib/validations/allMerchants'
import type { DraftApplicationsForm } from '@/lib/validations/draftApplications'

export const getDraftCount = async () => {
  try {
    const response = await instance.get<{ data: number }>('/merchants/draft-counts')

    return response.data.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(error.response?.data?.message)
    }
  }
}

export const getDraftData = async (merchantId: string) => {
  try {
    const response = await instance.get<{ data: MerchantDetails }>(
      `/merchants/${merchantId}`
    )

    return response.data.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(error.response?.data?.message)
    }
  }
}

export const createBusinessInfo = async (values: BusinessInfoForm) => {
  const formData = new FormData()

  // Loop over the form values and append each one to the form data.
  Object.entries(values).forEach(([key, value]) => {
    if (value instanceof File || typeof value === 'string') {
      formData.append(key, value)
    }
  })

  try {
    const response = await instance.post<FormReponse>('/merchants/draft', formData)
    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(
        error.response?.data?.message ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const updateBusinessInfo = async (
  values: BusinessInfoForm,
  merchantId: string
) => {
  const formData = new FormData()

  // Loop over the form values and append each one to the form data.
  Object.entries(values).forEach(([key, value]) => {
    if (value instanceof File || typeof value === 'string') {
      formData.append(key, value)
    }
  })

  try {
    const response = await instance.put<FormReponse>(
      `/merchants/${merchantId}/draft`,
      formData
    )
    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(
        error.response?.data?.message ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const createLocationInfo = async (
  values: LocationInfoForm,
  merchantId: string
) => {
  try {
    const response = await instance.post<FormReponse>(
      `/merchants/${merchantId}/locations`,
      values
    )

    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(
        error.response?.data?.message ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const updateLocationInfo = async (
  values: LocationInfoForm,
  merchantId: string,
  locationId: number
) => {
  try {
    const response = await instance.put<FormReponse>(
      `/merchants/${merchantId}/locations/${locationId}`,
      values
    )

    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(
        error.response?.data?.message ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const createOwnerInfo = async (values: OwnerInfoForm, merchantId: string) => {
  try {
    const response = await instance.post<FormReponse>(
      `/merchants/${merchantId}/business-owners`,
      values
    )

    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(
        error.response?.data?.message ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const updateOwnerInfo = async (
  values: OwnerInfoForm,
  merchantId: string,
  ownerId: number
) => {
  try {
    const response = await instance.put<FormReponse>(
      `/merchants/${merchantId}/business-owners/${ownerId}`,
      values
    )

    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(
        error.response?.data?.message ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const createContactPersonInfo = async (
  values: ContactPersonForm,
  merchantId: string
) => {
  try {
    const response = await instance.post<FormReponse>(
      `/merchants/${merchantId}/contact-persons`,
      values
    )

    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(
        error.response?.data?.message ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const updateContactPersonInfo = async (
  values: ContactPersonForm,
  merchantId: string,
  contactPersonId: number
) => {
  try {
    const response = await instance.put<FormReponse>(
      `/merchants/${merchantId}/contact-persons/${contactPersonId}`,
      values
    )

    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(
        error.response?.data?.message ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const changeStatusToReview = async (merchantId: string) => {
  try {
    return await instance.put(`/merchants/${merchantId}/ready-to-review`)
  } catch (error) {
    if (isAxiosError(error)) {
      alert(
        error.response?.data?.message || 'Something went wrong! Please try again later.'
      )
    }
  }
}

export const getMerchants = async (
  params: AllMerchantsForm | MerchantsFilterForm | DraftApplicationsForm
) => {
  try {
    const response = await instance.get<{ data: MerchantDetails[] }>('/merchants', {
      params,
    })

    return response.data.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(error.response?.data?.message)
    }
  }
}

export const getMerchant = async (merchantId: number) => {
  try {
    const response = await instance.get<{ data: MerchantDetails }>(
      `/merchants/${merchantId}`
    )

    return response.data.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(error.response?.data?.message)
    }
  }
}

export const approveMerchants = async (selectedMerchantIds: number[]) => {
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

export const rejectMerchants = async (selectedMerchantIds: number[], reason: string) => {
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

export const revertMerchants = async (selectedMerchantIds: number[], reason: string) => {
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
