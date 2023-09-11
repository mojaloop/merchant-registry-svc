import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useToast } from '@chakra-ui/react'

import type {
  BusinessInfoForm,
  ContactPersonForm,
  LocationInfoForm,
  OwnerInfoForm,
} from '@/lib/validations/registry'
import { FALLBACK_ERROR_MESSAGE } from '@/constants/errorMessage'
import { scrollToTop } from '@/utils'
import {
  changeStatusToReview,
  createBusinessInfo,
  createContactPersonInfo,
  createLocationInfo,
  createOwnerInfo,
  getCountries,
  getDistricts,
  getDraftCount,
  getSubdivisions,
  updateBusinessInfo,
  updateContactPersonInfo,
  updateLocationInfo,
  updateOwnerInfo,
} from '../forms'
import { getMerchant } from '../merchants'

const FORM_FALLBACK_ERROR_MESSAGE = 'Please check your data and try again.'

export function useDraftCount() {
  return useQuery({
    queryKey: ['draft-count'],
    queryFn: getDraftCount,
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Draft Count Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}

export function useDraft(merchantId: number) {
  return useQuery({
    queryKey: ['merchants', merchantId],
    queryFn: () => getMerchant(merchantId),
    enabled: !!merchantId,
    staleTime: 0,
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Draft Data Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Countries Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}

export function useSubdivisions(country: string) {
  return useQuery({
    queryKey: ['countries', country, 'subdivisions'],
    queryFn: () => getSubdivisions(country),
    enabled: !!country,
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Country Subdivisions Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}

export function useDistricts(country: string, subdivision: string) {
  return useQuery({
    queryKey: ['countries', country, 'subdivisions', subdivision, 'districts'],
    queryFn: () => getDistricts(country, subdivision),
    enabled: !!(country && subdivision),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Districts Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}

export function useCreateBusinessInfo(goToNextStep: () => void) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (params: BusinessInfoForm) => createBusinessInfo(params),
    onSuccess: data => {
      sessionStorage.setItem('merchantId', data.data.id.toString())
      queryClient.invalidateQueries(['draft-count'])
      toast({
        title: data.message,
        status: 'success',
      })
      goToNextStep()
      scrollToTop()
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Creating Failed!',
          description: error.response?.data.message || FORM_FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}

export function useUpdateBusinessInfo(goToNextStep: () => void) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({
      params,
      merchantId,
    }: {
      params: BusinessInfoForm
      merchantId: string
    }) => updateBusinessInfo(params, merchantId),
    onSuccess: data => {
      queryClient.invalidateQueries(['draft-count'])
      toast({
        title: data.message,
        status: 'success',
      })
      goToNextStep()
      scrollToTop()
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Updating Failed!',
          description: error.response?.data.message || FORM_FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}

export function useCreateLocationInfo(goToNextStep: () => void) {
  const toast = useToast()

  return useMutation({
    mutationFn: ({
      params,
      merchantId,
    }: {
      params: LocationInfoForm
      merchantId: string
    }) => createLocationInfo(params, merchantId),
    onSuccess: data => {
      toast({
        title: data.message,
        status: 'success',
      })
      goToNextStep()
      scrollToTop()
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Creating Failed!',
          description: error.response?.data.message || FORM_FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}

export function useUpdateLocationInfo(goToNextStep: () => void) {
  const toast = useToast()

  return useMutation({
    mutationFn: ({
      params,
      merchantId,
      locationId,
    }: {
      params: LocationInfoForm
      merchantId: string
      locationId: number
    }) => updateLocationInfo(params, merchantId, locationId),
    onSuccess: data => {
      toast({
        title: data.message,
        status: 'success',
      })
      goToNextStep()
      scrollToTop()
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Updating Failed!',
          description: error.response?.data.message || FORM_FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}

export function useCreateOwnerInfo(goToNextStep: () => void) {
  const toast = useToast()

  return useMutation({
    mutationFn: ({ params, merchantId }: { params: OwnerInfoForm; merchantId: string }) =>
      createOwnerInfo(params, merchantId),
    onSuccess: data => {
      toast({
        title: data.message,
        status: 'success',
      })
      goToNextStep()
      scrollToTop()
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Creating Failed!',
          description: error.response?.data.message || FORM_FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}

export function useUpdateOwnerInfo(goToNextStep: () => void) {
  const toast = useToast()

  return useMutation({
    mutationFn: ({
      params,
      merchantId,
      ownerId,
    }: {
      params: OwnerInfoForm
      merchantId: string
      ownerId: number
    }) => updateOwnerInfo(params, merchantId, ownerId),
    onSuccess: data => {
      toast({
        title: data.message,
        status: 'success',
      })
      goToNextStep()
      scrollToTop()
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Updating Failed!',
          description: error.response?.data.message || FORM_FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}

export function useCreateContactPerson(openReviewModal: () => void) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({
      params,
      merchantId,
    }: {
      params: ContactPersonForm
      merchantId: string
    }) => createContactPersonInfo(params, merchantId),
    onSuccess: data => {
      queryClient.invalidateQueries(['merchants'])
      toast({
        title: data.message,
        status: 'success',
      })
      openReviewModal()
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Creating Failed!',
          description: error.response?.data.message || FORM_FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}

export function useUpdateContactPerson(openReviewModal: () => void) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({
      params,
      merchantId,
      contactPersonId,
    }: {
      params: ContactPersonForm
      merchantId: string
      contactPersonId: number
    }) => updateContactPersonInfo(params, merchantId, contactPersonId),
    onSuccess: data => {
      queryClient.invalidateQueries(['merchants'])
      toast({
        title: data.message,
        status: 'success',
      })
      openReviewModal()
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Updating Failed!',
          description: error.response?.data.message || FORM_FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}

export function useChangeStatusToReview(closeReviewModal: () => void) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (merchantId: string) => changeStatusToReview(merchantId),
    onSuccess: () => {
      sessionStorage.removeItem('merchantId')
      closeReviewModal()
      queryClient.invalidateQueries(['draft-count'])
      queryClient.invalidateQueries(['pending-merchants'])
      queryClient.invalidateQueries(['all-merchants'])
      navigate('/registry')
      toast({
        title: 'Submission Successful!',
        description: 'Submitted the data successfully.',
        status: 'success',
      })
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Submission Failed!',
          description: error.response?.data.message || FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}
