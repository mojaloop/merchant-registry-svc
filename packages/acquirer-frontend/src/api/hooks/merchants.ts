import { useQuery } from '@tanstack/react-query'
import { MerchantRegistrationStatus } from 'shared-lib'

import type { AllMerchantsFilterForm } from '@/lib/validations/allMerchantsFilter'
import type { MerchantsFilterForm } from '@/lib/validations/merchantsFilter'
import { transformIntoTableData } from '@/utils'
import { getMerchant, getMerchants } from '../merchants'

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
    queryKey: ['drafts'],
    queryFn: () => getDrafts(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Operation Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function useAllMerchants(params: AllMerchantsFilterForm) {
  return useQuery({
    queryKey: ['all-merchants'],
    queryFn: () => getAllMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Operation Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function usePendingMerchants(params: MerchantsFilterForm) {
  return useQuery({
    queryKey: ['pending-merchants'],
    queryFn: () => getPendingMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Operation Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function useRejectedMerchants(params: MerchantsFilterForm) {
  return useQuery({
    queryKey: ['rejected-merchants'],
    queryFn: () => getRejectedMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Operation Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function useRevertedMerchants(params: MerchantsFilterForm) {
  return useQuery({
    queryKey: ['reverted-merchants'],
    queryFn: () => getRevertedMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Operation Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function useApprovedMerchants(params: MerchantsFilterForm) {
  return useQuery({
    queryKey: ['approved-merchants'],
    queryFn: () => getApprovedMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Operation Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}

export function useMerchant(merchantId: number) {
  return useQuery({
    queryKey: ['merchants', merchantId],
    queryFn: () => getMerchant(merchantId),
  })
}
