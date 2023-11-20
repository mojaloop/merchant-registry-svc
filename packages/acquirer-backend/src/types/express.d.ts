// express.d.ts
import { type PortalUserEntity } from 'src/entity/PortalUserEntity'

import { type Request } from 'express'

declare module 'express' {
  export interface Request {
    user?: PortalUserEntity
    token?: string
  }
}

export interface AuthRequest extends Request {
  user?: PortalUserEntity
  token?: string
}
