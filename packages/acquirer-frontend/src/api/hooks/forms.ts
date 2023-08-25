import { useQuery } from '@tanstack/react-query'

import { getDraftCount } from '../forms'
import { getMerchant } from '../merchants'

export function useDraftCount() {
  return useQuery({
    queryKey: ['draft-count'],
    queryFn: getDraftCount,
  })
}

export function useDraft(merchantId: number) {
  return useQuery({
    queryKey: ['merchants', merchantId],
    queryFn: () => getMerchant(merchantId),
    enabled: !!merchantId,
    meta: {
      toastStatus: 'error',
      toastTitle: 'Operation Failed!',
      toastDescription: 'Something went wrong! Please try again later.',
    },
  })
}
