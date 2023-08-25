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

export async function getDraftCount() {
  const response = await instance.get<{ data: number }>('/merchants/draft-counts')

  return response.data.data
}

export async function getDraftData(merchantId: string) {
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

export async function createBusinessInfo(values: BusinessInfoForm) {
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

export async function updateBusinessInfo(values: BusinessInfoForm, merchantId: string) {
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

export async function createLocationInfo(values: LocationInfoForm, merchantId: string) {
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

export async function updateLocationInfo(
  values: LocationInfoForm,
  merchantId: string,
  locationId: number
) {
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

export async function createOwnerInfo(values: OwnerInfoForm, merchantId: string) {
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

export async function updateOwnerInfo(
  values: OwnerInfoForm,
  merchantId: string,
  ownerId: number
) {
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

export async function createContactPersonInfo(
  values: ContactPersonForm,
  merchantId: string
) {
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

export async function updateContactPersonInfo(
  values: ContactPersonForm,
  merchantId: string,
  contactPersonId: number
) {
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

export async function changeStatusToReview(merchantId: string) {
  return await instance.put(`/merchants/${merchantId}/ready-to-review`)
}
