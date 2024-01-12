import type { DfspResponse } from '@/types/dfsps'
import type { PaginationParams } from '@/types/pagination'
import instance from '@/lib/axiosInstance'
import { type onboardDfspForm } from '@/lib/validations/onboardDfsp'

export function transformIntoTableData(dfspResponse: DfspResponse) {
  return {
    no: '',
    dfspId: dfspResponse.fspId,
    dfspName: dfspResponse.name,
    businessLicenseId: '',
    whetherMojaloopMerchantAcquiringPortalIsUsed: dfspResponse.client_secret,
  }
}

export async function getDfsps(params: PaginationParams) {
  try {
    const response = await instance.get<{ data: DfspResponse[]; totalPages: number }>(
      '/dfsps',
      { params }
    )

    if (response.status === 200) {
      const data = response.data.data.map(transformIntoTableData)
      const totalPages = response.data.totalPages
      return { data, totalPages }
    } else {
      throw new Error(`Failed to fetch data. Status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw new Error('Failed to fetch data. Please try again.')
  }
}
export async function onboardDfsp(dfsp: onboardDfspForm) {
  const response = await instance.post('/dfsps', dfsp)
  return response.data
}