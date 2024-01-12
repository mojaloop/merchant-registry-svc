export interface dfspInfo {
  no: string
  dfspId: string
  dfspName: string
  businessLicenseId: string
  whetherMojaloopMerchantAcquiringPortalIsUsed: string
}

export interface DfspResponse {
  id: number
  name: string
  fspId: string
  dfsp_type: string
  joined_date: string
  activated: boolean
  logo_uri: string
  business_license_id: string
  client_secret: string
  created_at: string
  updated_at: string
}
