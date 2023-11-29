import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'
import { isAxiosError } from 'axios'
import { MerchantRegistrationStatus } from 'shared-lib'

import type { MerchantDetails } from '@/types/merchantDetails'
import type { MerchantInfo } from '@/types/merchants'
import type { PaginationParams } from '@/types/pagination'
import { FALLBACK_ERROR_MESSAGE } from '@/constants/errorMessage'
import type { AllMerchantsFilterForm } from '@/lib/validations/allMerchantsFilter'
import type { MerchantsFilterForm } from '@/lib/validations/merchantsFilter'
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

type AllMerchantsParams = AllMerchantsFilterForm & PaginationParams
type MerchantsParams = MerchantsFilterForm & PaginationParams

function transformIntoTableData(merchantData: MerchantDetails): MerchantInfo {
  return {
    no: merchantData.id, // Assuming 'no' is the id of the merchant
    dbaName: merchantData.dba_trading_name,
    registeredName: merchantData.registered_name || 'N/A',

    // Assuming the first checkout counter's alias value is the payintoAccount
    payintoAccountId: merchantData.checkout_counters[0]?.alias_value || 'N/A',
    merchantType: merchantData.merchant_type,

    // Assuming the first location's country subdivision is the state
    town: merchantData.locations[0]?.town_name || 'N/A',
    countrySubdivision: merchantData.locations[0]?.country_subdivision || 'N/A',

    // Assuming the first checkout counter's description is the counterDescription
    counterDescription: merchantData.checkout_counters[0]?.description || 'N/A',
    registeredDfspName: merchantData.default_dfsp.name,
    registrationStatus: merchantData.registration_status,
    maker: merchantData.created_by,
  }
}

async function getDrafts(values: MerchantsParams) {
  const params = { ...values, registrationStatus: MerchantRegistrationStatus.DRAFT }
  const drafts = await getMerchants(params)

  return {
    data: drafts.data.map(transformIntoTableData),
    totalPages: drafts.totalPages,
  }
}

async function getAllMerchantRecords(values: AllMerchantsParams) {
  const allMerchants = await getMerchants(values)

  return {
    data: allMerchants.data.map(transformIntoTableData),
    totalPages: allMerchants.totalPages,
  }
}

async function getPendingMerchantRecords(values: MerchantsParams) {
  const params = { ...values, registrationStatus: MerchantRegistrationStatus.REVIEW }
  const pendingMerchants = await getMerchants(params)

  return {
    data: pendingMerchants.data.map(transformIntoTableData),
    totalPages: pendingMerchants.totalPages,
  }
}

async function getRejectedMerchantRecords(values: MerchantsParams) {
  const params = { ...values, registrationStatus: MerchantRegistrationStatus.REJECTED }
  const rejectedMerchants = await getMerchants(params)

  return {
    data: rejectedMerchants.data.map(transformIntoTableData),
    totalPages: rejectedMerchants.totalPages,
  }
}

async function getRevertedMerchantRecords(values: MerchantsParams) {
  const params = { ...values, registrationStatus: MerchantRegistrationStatus.REVERTED }
  const revertedMerchants = await getMerchants(params)

  return {
    data: revertedMerchants.data.map(transformIntoTableData),
    totalPages: revertedMerchants.totalPages,
  }
}

async function getAliasGeneratedMerchantRecords(values: MerchantsParams) {
  const params = {
    ...values,
    registrationStatus: MerchantRegistrationStatus.APPROVED,
  }
  const aliasGeneratedMerchants = await getMerchants(params)

  return {
    data: aliasGeneratedMerchants.data.map(transformIntoTableData),
    totalPages: aliasGeneratedMerchants.totalPages,
  }
}

export function useDrafts(params: MerchantsParams) {
  return useQuery({
    queryKey: ['drafts', params],
    queryFn: () => getDrafts(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Drafts Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}

export function useAllMerchants(params: AllMerchantsParams) {
  return useQuery({
    queryKey: ['all-merchants', params],
    queryFn: () => getAllMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Merchants Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}

export function usePendingMerchants(params: MerchantsParams) {
  return useQuery({
    queryKey: ['pending-merchants', params],
    queryFn: () => getPendingMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Pending Merchants Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}

export function useRejectedMerchants(params: MerchantsParams) {
  return useQuery({
    queryKey: ['rejected-merchants', params],
    queryFn: () => getRejectedMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Rejected Merchants Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}

export function useRevertedMerchants(params: MerchantsParams) {
  return useQuery({
    queryKey: ['reverted-merchants', params],
    queryFn: () => getRevertedMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Reverted Merchants Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}

export function useAliasGeneratedMerchants(params: MerchantsParams) {
  return useQuery({
    queryKey: ['alias-generated-merchants', params],
    queryFn: () => getAliasGeneratedMerchantRecords(params),
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching Alias Generated Merchants Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
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
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}

export function useApproveMerchants() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (selectedMerchantIds: number[]) => approveMerchants(selectedMerchantIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-merchants'])
      queryClient.invalidateQueries(['alias-generated-merchants'])
      toast({
        title: 'Approving Merchants Successful!',
        status: 'success',
      })
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Approving Failed!',
          description: error.response?.data.message || FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}

export function useRejectMerchants() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ selectedMerchantIds, reason }: ActionWithReasonParams) =>
      rejectMerchants(selectedMerchantIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-merchants'])
      queryClient.invalidateQueries(['rejected-merchants'])
      toast({
        title: 'Rejecting Merchants Successful!',
        status: 'success',
      })
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Rejecting Failed!',
          description: error.response?.data.message || FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}

export function useRevertMerchants() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ selectedMerchantIds, reason }: ActionWithReasonParams) =>
      revertMerchants(selectedMerchantIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-merchants'])
      queryClient.invalidateQueries(['reverted-merchants'])
      toast({
        title: 'Reverting Merchants Successful!',
        status: 'success',
      })
    },
    onError: error => {
      if (isAxiosError(error)) {
        toast({
          title: 'Reverting Failed!',
          description: error.response?.data.message || FALLBACK_ERROR_MESSAGE,
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
          description: error.response?.data.message || FALLBACK_ERROR_MESSAGE,
          status: 'error',
        })
      }
    },
  })
}
