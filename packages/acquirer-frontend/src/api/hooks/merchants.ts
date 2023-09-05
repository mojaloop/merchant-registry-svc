import { useMutation, useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useToast } from '@chakra-ui/react'
import { MerchantRegistrationStatus } from 'shared-lib'

import type { AllMerchantsFilterForm } from '@/lib/validations/allMerchantsFilter'
import type { MerchantsFilterForm } from '@/lib/validations/merchantsFilter'
import { transformIntoTableData } from '@/utils'
import {
  approveMerchants,
  exportMerchants,
  getMerchant,
  getMerchants,
  rejectMerchants,
  revertMerchants,
} from '../merchants'

interface ActionWithReasonParams {
  selectedMerchantIds: number[]
  reason: string
}

async function getDrafts(values: MerchantsFilterForm) {
  const params = { ...values, registrationStatus: MerchantRegistrationStatus.DRAFT }
  const drafts = await getMerchants(params)

  return drafts.map(transformIntoTableData)
}

async function getAllMerchantRecords(values: AllMerchantsFilterForm) {
  const allMerchants = await getMerchants(values)

  return allMerchants.map(transformIntoTableData)
}

async function getPendingMerchantRecords(values: MerchantsFilterForm) {
  const params = { ...values, registrationStatus: MerchantRegistrationStatus.REVIEW }
  const pendingMerchants = await getMerchants(params)

  return pendingMerchants.map(transformIntoTableData)
}

async function getRejectedMerchantRecords(values: MerchantsFilterForm) {
  const params = { ...values, registrationStatus: MerchantRegistrationStatus.REJECTED }
  const rejectedMerchants = await getMerchants(params)

  return rejectedMerchants.map(transformIntoTableData)
}

async function getRevertedMerchantRecords(values: MerchantsFilterForm) {
  const params = { ...values, registrationStatus: MerchantRegistrationStatus.REVERTED }
  const revertedMerchants = await getMerchants(params)

  return revertedMerchants.map(transformIntoTableData)
}

async function getApprovedMerchantRecords(values: MerchantsFilterForm) {
  const params = {
    ...values,
    registrationStatus: MerchantRegistrationStatus.WAITINGALIASGENERATION,
  }
  const approvedMerchants = await getMerchants(params)

  return approvedMerchants.map(transformIntoTableData)
}

export function useDrafts(params: MerchantsFilterForm) {
  return useQuery({
    queryKey: ['drafts', params],
    queryFn: () => getDrafts(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Drafts Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function useAllMerchants(params: AllMerchantsFilterForm) {
  return useQuery({
    queryKey: ['all-merchants', params],
    queryFn: () => getAllMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Merchants Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function usePendingMerchants(params: MerchantsFilterForm) {
  return useQuery({
    queryKey: ['pending-merchants', params],
    queryFn: () => getPendingMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Pending Merchants Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function useRejectedMerchants(params: MerchantsFilterForm) {
  return useQuery({
    queryKey: ['rejected-merchants', params],
    queryFn: () => getRejectedMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Rejected Merchants Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function useRevertedMerchants(params: MerchantsFilterForm) {
  return useQuery({
    queryKey: ['reverted-merchants', params],
    queryFn: () => getRevertedMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Reverted Merchants Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function useApprovedMerchants(params: MerchantsFilterForm) {
  return useQuery({
    queryKey: ['approved-merchants', params],
    queryFn: () => getApprovedMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Approved Merchants Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function useMerchant(merchantId: number) {
  return useQuery({
    queryKey: ['merchants', merchantId],
    queryFn: () => getMerchant(merchantId),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Merchant Data Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function useApproveMerchants() {
  const toast = useToast()

  return useMutation({
    mutationFn: (selectedMerchantIds: number[]) => approveMerchants(selectedMerchantIds),
    onSuccess: () => {
      toast({
        title: 'Approving Merchants Successful!',
        status: 'success',
      })
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Approving Failed!',
          description: error.response?.data.message,
          status: 'error',
        })
      }
    },
  })
}

export function useRejectMerchants() {
  const toast = useToast()

  return useMutation({
    mutationFn: ({ selectedMerchantIds, reason }: ActionWithReasonParams) =>
      rejectMerchants(selectedMerchantIds, reason),
    onSuccess: () => {
      toast({
        title: 'Rejecting Merchants Successful!',
        status: 'success',
      })
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Rejecting Failed!',
          description: error.response?.data.message,
          status: 'error',
        })
      }
    },
  })
}

export function useRevertMerchants() {
  const toast = useToast()

  return useMutation({
    mutationFn: ({ selectedMerchantIds, reason }: ActionWithReasonParams) =>
      revertMerchants(selectedMerchantIds, reason),
    onSuccess: () => {
      toast({
        title: 'Reverting Merchants Successful!',
        status: 'success',
      })
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Reverting Failed!',
          description: error.response?.data.message,
          status: 'error',
        })
      }
    },
  })
}

export function useExportMerchants() {
  const toast = useToast()

  return useMutation({
    mutationFn: (params: AllMerchantsFilterForm | MerchantsFilterForm) =>
      exportMerchants(params),
    onSuccess: () => {
      toast({
        title: 'Exporting Merchants Successful!',
        status: 'success',
      })
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Exporting Failed!',
          description: error.response?.data.message,
          status: 'error',
        })
      }
    },
  })
}
