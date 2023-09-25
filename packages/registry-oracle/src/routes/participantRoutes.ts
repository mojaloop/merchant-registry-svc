import {ifError} from 'assert'
import express, { type Request, type Response } from 'express'
import {AuditActionType, AuditTrasactionStatus} from 'shared-lib'
import {AppDataSource} from '../database/dataSource'
import {RegistryEntity} from '../entity/RegistryEntity'
import {authenticateAPIAccess} from '../middleware/authenticate'
import logger from '../services/logger'
import {readEnv} from '../setup/readEnv'
import {EndpointAuthRequest} from '../types/express'
import {audit} from '../utils/audit'
import {prepareError} from '../utils/error'

const ALIAS_CHECKOUT_MAX_DIGITS = readEnv('ALIAS_CHECKOUT_MAX_DIGITS', 10) as number;

const router = express.Router()
router.get('/participants/:type/:id', async (req: Request, res: Response) => {
  const {type, id} = req.params 

  if(type == undefined || type == null || type != 'PAYINTOID') {
    logger.error('Invalid Type')
    await audit(
      AuditActionType.ACCESS, 
      AuditTrasactionStatus.FAILURE, 
      'getParticipants',
      'GET Participants: Invalid Type', 
      'RegistryEntity',
      {}, {type}
    )
    return res.status(400).send(prepareError('Invalid Type'))
  }

  if(id == undefined || id == null) {
    logger.error('Invalid ID')
    await audit(
      AuditActionType.ACCESS, 
      AuditTrasactionStatus.FAILURE, 
      'getParticipants',
      'GET Participants: Invalid ID', 
      'RegistryEntity',
      {}, {id}
    )
    return res.status(400).send(prepareError('Invalid Id'))
  }

  const registryRecord = await AppDataSource.manager.findOne(RegistryEntity, {
    where: { alias_value: id },
    select: ['fspId', 'currency'] 
  })
  
  res.send({partyList: registryRecord ? [registryRecord] : []})
  res.send()
})

router.post('/participants', authenticateAPIAccess, async (req: EndpointAuthRequest, res: Response) => {
  const endpoint = req.endpoint
  if(!endpoint) {
    logger.error('Invalid Endpoint')
    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.FAILURE,
      'postParticipants',
      'POST Participants: Invalid Endpoint',
      'RegistryEntity',
      {}, {}, endpoint
    )
    return res.status(400).send(prepareError('Authentication Error'))
  }

  const {fspId, currency } = req.body

  if(fspId == undefined || fspId == null) {
    logger.error('Invalid FSP ID')
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'postParticipants',
      'POST Participants: Invalid FSP ID',
      'RegistryEntity',
      {}, {fspId}
    )
    return res.status(400).send(prepareError('Invalid FSP ID'))
  }

  if(currency == undefined || currency == null) {
    logger.error('Invalid Currency')
    await audit(
      AuditActionType.ACCESS,
      AuditTrasactionStatus.FAILURE,
      'postParticipants',
      'POST Participants: Invalid Currency',
      'RegistryEntity',
      {}, {currency}
    )
    return res.status(400).send(prepareError('Invalid Currency'))
  }

  // if(alias_value == undefined || alias_value == null) {
  //   logger.error('Invalid Alias Value')
  //   await audit(
  //     AuditActionType.ACCESS,
  //     AuditTrasactionStatus.FAILURE,
  //     'postParticipants',
  //     'POST Participants: Invalid Alias Value',
  //     'RegistryEntity',
  //     {}, {alias_value}
  //   )
  //   return res.status(400).send(prepareError('Invalid Alias Value'))
  // }

  // Fetch the maximum alias_value from the database
  const registryRepository = AppDataSource.getRepository(RegistryEntity)
  const maxAliasEntity = await registryRepository.find({
    select: ["alias_value"],
    order: { alias_value: "DESC" },
    take: 1
  });

  // Initialize maxAliasValue
  let maxAliasValue = maxAliasEntity.length > 0 ? parseInt(maxAliasEntity[0].alias_value, 10) + 1 : 1;
  const paddedAliasValue = maxAliasValue.toString().padStart(ALIAS_CHECKOUT_MAX_DIGITS, "0");

  const newRegistryRecord = new RegistryEntity()
  newRegistryRecord.fspId = endpoint.dfsp_id // TODO: Should be the FSP ID of registered API Accessed DFSP
  newRegistryRecord.dfsp_name = endpoint.dfsp_name
  newRegistryRecord.currency = currency
  newRegistryRecord.alias_value = paddedAliasValue

  await AppDataSource.manager.save(newRegistryRecord)

  await audit(
    AuditActionType.ACCESS,
    AuditTrasactionStatus.SUCCESS,
    'postParticipants',
    'POST Participants: Participant created',
    'RegistryEntity',
    {}, {fspId, currency}
  )

  res.status(200).send({fspId, currency, alias_value: paddedAliasValue})
})

export default router
