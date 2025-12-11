import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'
import { isAxiosError } from 'axios'

import { FALLBACK_ERROR_MESSAGE } from '@/constants/errorMessage'
import type {
  BusinessInfoForm,
  ContactPersonForm,
  LocationInfoForm,
  OwnerInfoForm,
} from '@/lib/validations/registry'
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

type MutationSuccessCallback = () => void

interface CreateMutationOptions<TParams> {
  mutationFn: (params: TParams) => Promise<{ message: string; data?: {id: string | number} }>
  onSuccessCallback: MutationSuccessCallback
  createErrorTitle: string
  invalidateQueries?: string[]
  saveMerchantId?: boolean
}

interface UpdateMutationOptions<TParams, TIds> {
  mutationFn: (params: TParams, ids: TIds) => Promise<{ message: string }>
  onSuccessCallback: MutationSuccessCallback
  updateErrorTitle: string
  invalidateQueries?: string[]
}

function useCreateMutation<TParams>({
  mutationFn,
  onSuccessCallback,
  createErrorTitle,
  invalidateQueries = [],
  saveMerchantId = false,
}: CreateMutationOptions<TParams>) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn,
    onSuccess: data => {
      if (saveMerchantId && data.data?.id) {
        localStorage.setItem('merchantId', data.data.id.toString())
      }
      invalidateQueries.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] })
      })
      toast({
        title: data.message,
        status: 'success',
      })
      onSuccessCallback()
      scrollToTop()
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: createErrorTitle,
          description: error.response?.data.message || FORM_FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}

function useUpdateMutation<TParams, TIds>({
  mutationFn,
  onSuccessCallback,
  updateErrorTitle,
  invalidateQueries = [],
}: UpdateMutationOptions<TParams, TIds>) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ params, ...ids }: { params: TParams } & TIds) => mutationFn(params, ids as TIds),
    onSuccess: data => {
      invalidateQueries.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] })
      })
      toast({
        title: data.message,
        status: 'success',
      })
      onSuccessCallback()
      scrollToTop()
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: updateErrorTitle,
          description: error.response?.data.message || FORM_FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}

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
  return useCreateMutation<BusinessInfoForm>({
    mutationFn: createBusinessInfo,
    onSuccessCallback: goToNextStep,
    createErrorTitle: 'Creating Failed!',
    invalidateQueries: ['draft-count'],
    saveMerchantId: true,
  })
}

export function useUpdateBusinessInfo(goToNextStep: () => void) {
  return useUpdateMutation<BusinessInfoForm, { merchantId: string }>({
    mutationFn: (params, { merchantId }) => updateBusinessInfo(params, merchantId),
    onSuccessCallback: goToNextStep,
    updateErrorTitle: 'Updating Failed!',
    invalidateQueries: ['draft-count'],
  })
}

export function useCreateLocationInfo(goToNextStep: () => void) {
  return useUpdateMutation<LocationInfoForm, { merchantId: string }>({
    mutationFn: (params, { merchantId }) => createLocationInfo(params, merchantId),
    onSuccessCallback: goToNextStep,
    updateErrorTitle: 'Creating Failed!',
  })
}

export function useUpdateLocationInfo(goToNextStep: () => void) {
  return useUpdateMutation<LocationInfoForm, { merchantId: string; locationId: number }>({
    mutationFn: (params, { merchantId, locationId }) => updateLocationInfo(params, merchantId, locationId),
    onSuccessCallback: goToNextStep,
    updateErrorTitle: 'Updating Failed!',
  })
}

export function useCreateOwnerInfo(goToNextStep: () => void) {
  return useUpdateMutation<OwnerInfoForm, { merchantId: string }>({
    mutationFn: (params, { merchantId }) => createOwnerInfo(params, merchantId),
    onSuccessCallback: goToNextStep,
    updateErrorTitle: 'Creating Failed!',
  })
}

export function useUpdateOwnerInfo(goToNextStep: () => void) {
  return useUpdateMutation<OwnerInfoForm, { merchantId: string; ownerId: number }>({
    mutationFn: (params, { merchantId, ownerId }) => updateOwnerInfo(params, merchantId, ownerId),
    onSuccessCallback: goToNextStep,
    updateErrorTitle: 'Updating Failed!',
  })
}

export function useCreateContactPerson(openReviewModal: () => void) {
  return useUpdateMutation<ContactPersonForm, { merchantId: string }>({
    mutationFn: (params, { merchantId }) => createContactPersonInfo(params, merchantId),
    onSuccessCallback: openReviewModal,
    updateErrorTitle: 'Creating Failed!',
    invalidateQueries: ['merchants'],
  })
}

export function useUpdateContactPerson(openReviewModal: () => void) {
  return useUpdateMutation<ContactPersonForm, { merchantId: string; contactPersonId: number }>({
    mutationFn: (params, { merchantId, contactPersonId }) =>
      updateContactPersonInfo(params, merchantId, contactPersonId),
    onSuccessCallback: openReviewModal,
    updateErrorTitle: 'Updating Failed!',
    invalidateQueries: ['merchants'],
  })
}

export function useChangeStatusToReview(closeReviewModal: () => void) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (merchantId: string) => changeStatusToReview(merchantId),
    onSuccess: () => {
      localStorage.removeItem('merchantId')
      closeReviewModal()
      queryClient.invalidateQueries({ queryKey: ['draft-count'] })
      queryClient.invalidateQueries({ queryKey: ['drafts'] })
      queryClient.invalidateQueries({ queryKey: ['pending-merchants'] })
      queryClient.invalidateQueries({ queryKey: ['all-merchants'] })
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
