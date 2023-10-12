import {AppDataSource} from "../database/dataSource";
import {EndpointDFSPEntity} from "../entity/EndpointDFSPEntity";
import {APIAccessEntity} from "../entity/APIAccessEntity";

import logger from "./logger";

export interface DFSPData {
  fspId: string;
  dfsp_name: string;
  client_secret: string;
}

export async function registerEndpointDFSP (dfspData: DFSPData): Promise<APIAccessEntity> {
  logger.debug('Registering DFSP: %o', dfspData);

  const endpointDfsp = new EndpointDFSPEntity();
  endpointDfsp.fspId = dfspData.fspId;
  endpointDfsp.dfsp_name = dfspData.dfsp_name;

  const apiAccess = new APIAccessEntity();
  apiAccess.client_secret = dfspData.client_secret;
  apiAccess.endpoints = [endpointDfsp]

  await AppDataSource.manager.transaction(async transactionalEntityManager => {
    await transactionalEntityManager.save(EndpointDFSPEntity, endpointDfsp);
    await transactionalEntityManager.save(APIAccessEntity, apiAccess);
  });

  logger.debug('DFSP registered: %o', dfspData);
  return apiAccess;
}


