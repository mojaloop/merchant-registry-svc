import { useQuery } from '@tanstack/react-query'

import { FALLBACK_ERROR_MESSAGE } from '@/constants/errorMessage'
import { getMojaloopDfsps } from '../mojaloopDfsps'

export function useMojaloopDfsps() {
  return useQuery({
    queryKey: ['mojaloop-dfsps'],
    queryFn: getMojaloopDfsps,
    meta: {
      toastStatus: 'error',
      toastTitle: 'Fetching mojaloop dfsps Failed!',
      toastDescription: FALLBACK_ERROR_MESSAGE,
    },
  })
}
