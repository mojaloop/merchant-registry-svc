// express.d.ts

import { type Request } from 'express'
import { type DFSPEntity } from '../entity/DFSPEntity'

declare module 'express' {
  export interface Request {
    dfsp?: DFSPEntity
  }
}

export interface EndpointAuthRequest extends Request {
  dfsp?: DFSPEntity
}
