import { AppDataSource } from '../database/dataSource'
import { DFSPEntity } from '../entity/DFSPEntity'
import { APIAccessEntity } from '../entity/APIAccessEntity'

import logger from './logger'

export interface DFSPData {
  fspId: string
  dfsp_name: string
  client_secret: string
}

export async function registerEndpointDFSP (dfspData: DFSPData): Promise<APIAccessEntity> {
  logger.debug('Registering DFSP: %o', dfspData)

  let dfsp = await AppDataSource.manager.findOne(DFSPEntity, { where: { fspId: dfspData.fspId } })
  if (dfsp == null) {
    dfsp = new DFSPEntity()
  }

  dfsp.fspId = dfspData.fspId
  dfsp.dfsp_name = dfspData.dfsp_name

  const apiAccess = new APIAccessEntity()
  apiAccess.client_secret = dfspData.client_secret
  apiAccess.dfsp = dfsp

  await AppDataSource.manager.transaction(async transactionalEntityManager => {
    await transactionalEntityManager.save(DFSPEntity, dfsp as DFSPEntity) // I guranatee that dfsp is not null here
    await transactionalEntityManager.save(APIAccessEntity, apiAccess)
  })

  logger.debug('DFSP registered: %o', dfspData)
  return apiAccess
}
