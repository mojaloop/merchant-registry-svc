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

/**
 * @openapi
 * tags:
 *   name: Participants
 *
 * /participants/{type}/{id}:
 *   get:
 *     tags:
 *       - Participants
 *     summary: Get Participants based on type and ID
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         description: Type of the participant
 *         schema:
 *           type: string
 *           enum: [MERCHANT_PAYINTOID]
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the participant
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved participant(s)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 partyList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fspId:
 *                         type: string
 *                       currency:
 *                         type: string
 *       400:
 *         description: Invalid Type or Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 * 
 */
router.get('/participants/:type/:id', async (req: Request, res: Response) => {
  const {type, id} = req.params 

  if(type == undefined || type == null || type != 'MERCHANT_PAYINTOID') {
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
  
  await audit(
    AuditActionType.ACCESS,
    AuditTrasactionStatus.SUCCESS,
    'getParticipants',
    'GET Participants: Participant retrieved',
    'RegistryEntity',
    {}, {partyList: registryRecord}
  )

  logger.debug('registryRecord Retrieved: %o', registryRecord)
  res.send({partyList: registryRecord ? [registryRecord] : []})
})

/**
 * @openapi
 * tags:
 *   name: Participants
 *
 * /participants:
 *   post:
 *     tags:
 *       - Participants
 *     summary: Create a new participant
 *     parameters:
 *       - name: x-api-key
 *         in: header
 *         required: true
 *         description: API key for accessing the endpoint
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fspId:
 *                 type: string
 *                 description: Financial Service Provider ID
 *               currency:
 *                 type: string
 *                 description: Currency code
 *     responses:
 *       200:
 *         description: Successfully created participant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fspId:
 *                   type: string
 *                 currency:
 *                   type: string
 *                 alias_value:
 *                   type: string
 *       400:
 *         description: Invalid input, object invalid, or authentication error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 * 
 */
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
