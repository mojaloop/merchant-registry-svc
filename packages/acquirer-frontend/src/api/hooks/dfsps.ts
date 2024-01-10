import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { dfspInfo } from '@/types/dfsps'
import { isAxiosError } from 'axios'
import { useToast } from '@chakra-ui/react'
import type { PaginationParams } from '@/types/pagination'
import { FALLBACK_ERROR_MESSAGE } from '@/constants/errorMessage'
import { getDfsps, onboardDfsp } from '../dfsps'

export function useDfsps(params: dfspInfo & PaginationParams) {
    const dfspList = useQuery({
        queryKey: ['dfsps', params],
        queryFn: () => getDfsps(params),
        meta: {
            toastStatus: 'error',
            toastTitle: 'Fetching Dfsps Failed!',
            toastDescription: FALLBACK_ERROR_MESSAGE,
        },
    })

    // Log the dfspList
    console.log('Dfsp List:', dfspList);

    // Error handling
    if (dfspList.error) {
        console.error('Error fetching data:', dfspList.error);
    }

    // Loading state rendering
    if (dfspList.isLoading) {
        console.log("it is loading");
    }

    return dfspList;
}
export function useOnboardDfsp() {
    const queryClient = useQueryClient()
    const toast = useToast()

    return useMutation({
        mutationFn: onboardDfsp,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dfsps'] })
            toast({
                title: 'dfsp onboarding Successful!',
                description: 'Please notify the dfsp.',
                status: 'success',
            })
        },
        onError: error => {
            if (isAxiosError(error)) {
                toast({
                    title: 'Dfsp onboarding Failed!',
                    description: error.response?.data.message || FALLBACK_ERROR_MESSAGE,
                    status: 'error',
                })
            }
        },
    })
}
