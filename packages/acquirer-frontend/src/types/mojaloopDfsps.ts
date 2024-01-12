export interface mojaloopDfsp {
  id: number
  dfsp_id: string
  dfsp_name: string
}

export interface mojaloopDfspsResponse {
  data: mojaloopDfsp[]
  message: string
}
