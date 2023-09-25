interface Endpoint {
  dfsp_id: string
  dfsp_name: string
  id: number
  created_at: string
  updated_at: string
}

interface RegisterEndpointDFSPData {
  client_secret: string
  endpoints: Endpoint[]
  id: number
  created_at: string
  updated_at: string
}

interface AliasData {
  merchant_id: number
  fspId: string
  dfsp_name: string
  checkout_counter_id: number
  alias_value: string
  currency: string
  id: number
  alias_type: string
  created_at: string
  updated_at: string
}

interface RegisterEndpointDFSPPayload {
  command: 'registerEndpointDFSP'
  data: RegisterEndpointDFSPData
}
interface BulkGenerateAliasReplyPayload {
  command: 'bulkGenerateAlias'
  data: AliasData[]
}

export type MessagePayload = RegisterEndpointDFSPPayload | BulkGenerateAliasReplyPayload
