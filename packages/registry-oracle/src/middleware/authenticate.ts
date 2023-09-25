import path from 'path'
import dotenv from 'dotenv'
import { type Request, type Response, type NextFunction } from 'express'
import {APIAccessEntity} from '../entity/APIAccessEntity'
import {AppDataSource} from '../database/dataSource'
import {prepareError} from '../utils/error'
import {audit} from '../utils/audit'
import {AuditActionType, AuditTrasactionStatus} from 'shared-lib'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true })
}

export const JWT_SECRET = process.env.JWT_SECRET ?? ''

export async function authenticateAPIAccess (req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (apiKey == null || apiKey == undefined) {
    await audit(
      AuditActionType.UNAUTHORIZED_ACCESS,
      AuditTrasactionStatus.FAILURE, 
      'authenticateAPIAccess',
      'Missing x-api-key header', 
      'APIAccessEntity', {}, {}
    )
    return res.status(400).send(prepareError('Missing header: x-api-key'))
  }

  const apiAccess = await AppDataSource.manager.findOne(APIAccessEntity, { 
    where: {client_secret: apiKey} ,
    relations: ['endpoints']
  }) 

  if (apiAccess == null) {
    await audit(
      AuditActionType.UNAUTHORIZED_ACCESS,
      AuditTrasactionStatus.FAILURE,
      'authenticateAPIAccess',
      'Invalid API Key',
      'APIAccessEntity',
      {}, {apiKey}
    )
    return res.status(400).send(prepareError('Invalid API key'))
  }


  if(apiAccess.endpoints.length == 0) {
    return res.status(400).send(prepareError('No endpoints configured for this API key'))
  }

  req.endpoint = apiAccess.endpoints[0]
  next()
}

