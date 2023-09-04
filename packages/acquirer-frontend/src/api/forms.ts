import type { FormReponse } from '@/types/forms'
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

export async function createBusinessInfo(values: BusinessInfoForm) {
  const formData = new FormData()

  // Loop over the form values and append each one to the form data.
  Object.entries(values).forEach(([key, value]) => {
    if (value instanceof File || typeof value === 'string') {
      formData.append(key, value)
    }
  })

  const response = await instance.post<FormReponse>('/merchants/draft', formData)
  return response.data
}

export async function updateBusinessInfo(values: BusinessInfoForm, merchantId: string) {
  const formData = new FormData()

  // Loop over the form values and append each one to the form data.
  Object.entries(values).forEach(([key, value]) => {
    if (value instanceof File || typeof value === 'string') {
      formData.append(key, value)
    }
  })

  const response = await instance.put<FormReponse>(
    `/merchants/${merchantId}/draft`,
    formData
  )
  return response.data
}

export async function createLocationInfo(values: LocationInfoForm, merchantId: string) {
  const response = await instance.post<FormReponse>(
    `/merchants/${merchantId}/locations`,
    values
  )
  return response.data
}

export async function updateLocationInfo(
  values: LocationInfoForm,
  merchantId: string,
  locationId: number
) {
  const response = await instance.put<FormReponse>(
    `/merchants/${merchantId}/locations/${locationId}`,
    values
  )
  return response.data
}

export async function createOwnerInfo(values: OwnerInfoForm, merchantId: string) {
  const response = await instance.post<FormReponse>(
    `/merchants/${merchantId}/business-owners`,
    values
  )
  return response.data
}

export async function updateOwnerInfo(
  values: OwnerInfoForm,
  merchantId: string,
  ownerId: number
) {
  const response = await instance.put<FormReponse>(
    `/merchants/${merchantId}/business-owners/${ownerId}`,
    values
  )
  return response.data
}

export async function createContactPersonInfo(
  values: ContactPersonForm,
  merchantId: string
) {
  const response = await instance.post<FormReponse>(
    `/merchants/${merchantId}/contact-persons`,
    values
  )
  return response.data
}

export async function updateContactPersonInfo(
  values: ContactPersonForm,
  merchantId: string,
  contactPersonId: number
) {
  const response = await instance.put<FormReponse>(
    `/merchants/${merchantId}/contact-persons/${contactPersonId}`,
    values
  )
  return response.data
}

export async function changeStatusToReview(merchantId: string) {
  const response = await instance.put(`/merchants/${merchantId}/ready-to-review`)
  return response.data
}
