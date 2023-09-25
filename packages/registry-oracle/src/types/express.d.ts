// express.d.ts

import { type Request } from 'express'
import {EndpointDFSPEntity} from '../entity/EndpointDFSPEntity'

declare module 'express' {
  export interface Request {
    endpoint?: EndpointDFSPEntity
  }
}

export interface EndpointAuthRequest extends Request {
  endpoint?: EndpointDFSPEntity
}
