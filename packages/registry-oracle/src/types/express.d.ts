// express.d.ts

import { type Request } from 'express'
import { type EndpointDFSPEntity } from '../entity/EndpointDFSPEntity'

declare module 'express' {
  export interface Request {
    endpoint?: EndpointDFSPEntity
  }
}

export interface EndpointAuthRequest extends Request {
  endpoint?: EndpointDFSPEntity
}
