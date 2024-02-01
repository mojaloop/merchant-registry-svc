export interface dfspInfo {
  no: number // dfsp database id
  dfspId: string // dfsp mojaloop id
  dfspName: string
  businessLicenseId: string
  // isUsingAcquiringPortal: string
}

export interface DfspResponse {
  id: number // dfsp database id
  name: string
  fspId: string // dfsp mojaloop id
  dfsp_type: string
  joined_date: string
  activated: boolean
  logo_uri: string
  business_license_id: string
  client_secret: string
  created_at: string
  updated_at: string
}
