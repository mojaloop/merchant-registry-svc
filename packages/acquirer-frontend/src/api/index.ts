import { isAxiosError } from 'axios'
import { MerchantRegistrationStatus } from 'shared-lib'

import type { DraftData, FormReponse } from '@/types/form'
import type { MerchantRecord } from '@/types/merchants'
import instance from '@/lib/axiosInstance'
import type {
  BusinessInfo,
  ContactPerson,
  LocationInfo,
  OwnerInfo,
} from '@/lib/validations/registry'
import type { PendingMerchants } from '@/lib/validations/pendingMerchants'
import type { AllMerchants } from '@/lib/validations/allMerchants'
import type { DraftApplications } from '@/lib/validations/draftApplications'

export const getDraftData = async (merchantId: string) => {
  const token = sessionStorage.getItem('token')
  if (!token) {
    alert('You are not logged in!')
    return
  }

  try {
    const response = await instance.get<{ data: DraftData }>(`/merchants/${merchantId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(error.response?.data?.message)
    }
  }
}

export const createBusinessInfo = async (values: BusinessInfo) => {
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
        error.response?.data?.error ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const updateBusinessInfo = async (values: BusinessInfo, merchantId: string) => {
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
        error.response?.data?.error ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const createLocationInfo = async (values: LocationInfo, merchantId: string) => {
  try {
    const response = await instance.post<FormReponse>(
      `/merchants/${merchantId}/locations`,
      values
    )

    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(
        error.response?.data?.error ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const updateLocationInfo = async (
  values: LocationInfo,
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
        error.response?.data?.error ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const createOwnerInfo = async (values: OwnerInfo, merchantId: string) => {
  try {
    const response = await instance.post<FormReponse>(
      `/merchants/${merchantId}/business-owners`,
      values
    )

    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      alert(
        error.response?.data?.error ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const updateOwnerInfo = async (
  values: OwnerInfo,
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
        error.response?.data?.error ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const createContactPersonInfo = async (
  values: ContactPerson,
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
        error.response?.data?.error ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const updateContactPersonInfo = async (
  values: ContactPerson,
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
        error.response?.data?.error ||
          'Something went wrong! Please check your data and try again.'
      )
    }
  }
}

export const getMerchants = async (
  params: AllMerchants | PendingMerchants | DraftApplications
) => {
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
