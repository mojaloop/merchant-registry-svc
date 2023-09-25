import {AppDataSource} from "../database/dataSource";
import {EndpointDFSPEntity} from "../entity/EndpointDFSPEntity";
import {APIAccessEntity} from "../entity/APIAccessEntity";

import logger from "./logger";
import {generateApiKey} from "../utils/utils";

export interface DFSPData {
  dfsp_id: string;
  dfsp_name: string;
  dfsp_api_endpoint: string;
}

export async function registerEndpointDFSP (dfspData: DFSPData): Promise<APIAccessEntity> {
  logger.debug('Registering DFSP: %o', dfspData);

  const endpointDfsp = new EndpointDFSPEntity();
  endpointDfsp.dfsp_id = dfspData.dfsp_id;
  endpointDfsp.dfsp_name = dfspData.dfsp_name;

  const apiAccess = new APIAccessEntity();
  apiAccess.client_secret = generateApiKey();
  apiAccess.endpoints = [endpointDfsp]

  await AppDataSource.manager.transaction(async transactionalEntityManager => {
    await transactionalEntityManager.save(EndpointDFSPEntity, endpointDfsp);
    await transactionalEntityManager.save(APIAccessEntity, apiAccess);
  });

  logger.debug('DFSP registered: %o', dfspData);
  return apiAccess;
}


