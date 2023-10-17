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
import {findIncrementAliasValue} from '../utils/utils'

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

  // Don't check for type for now
  // if(type == undefined || type == null || type != 'MERCHANT_PAYINTOID') {
  //   logger.error('Invalid Type')
  //   await audit(
  //     AuditActionType.ACCESS, 
  //     AuditTrasactionStatus.FAILURE, 
  //     'getParticipants',
  //     'GET Participants: Invalid Type', 
  //     'RegistryEntity',
  //     {}, {type}
  //   )
  //   return res.status(400).send(prepareError('Invalid Type'))
  // }

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
 *               currency:
 *                 type: string
 *                 description: Currency code
 *                 example: USD
 *               alias_value:
 *                 type: string
 *                 description: Alias value
 *                 required: false
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

  const { currency, alias_value } = req.body

  if(currency == undefined || currency == null) {
    logger.error('Invalid Currency')
    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.FAILURE,
      'postParticipants',
      'POST Participants: Invalid Currency',
      'RegistryEntity',
      {}, {currency}
    )
    return res.status(400).send(prepareError('Invalid Currency'))
  }

  const registryRepository = AppDataSource.getRepository(RegistryEntity)

  let paddedAliasValue = alias_value;
  let headPointerAliasValue: RegistryEntity | null = null;

  if(alias_value == undefined || alias_value == null) {
    // find head pointer
    headPointerAliasValue = await registryRepository.findOne({
      where: { is_incremental_head: true },
      select: ["alias_value"]
    });

    if(headPointerAliasValue) {
      // If head pointer exists, just increment it
      paddedAliasValue = findIncrementAliasValue(headPointerAliasValue.alias_value);
    } else {
        // If no record exists, start from 1
        paddedAliasValue = findIncrementAliasValue('0');
    }

  }else{
    // Check if the alias_value already exists
    const existingAliasEntity = await registryRepository.findOne({
      where: { alias_value: alias_value },

      select: ["alias_value"]
    });

    if(existingAliasEntity) {
      logger.error('Alias Value already exists')
      await audit(
        AuditActionType.ADD,
        AuditTrasactionStatus.FAILURE,
        'postParticipants',
        'POST Participants: Alias Value already exists',
        'RegistryEntity',
        {}, {alias_value}
      )
      return res.status(400).send(prepareError('Alias Value already exists'))
    }

    // Check if the alias_value is a number
    if(isNaN(alias_value)) {
      logger.error('Invalid Alias Value')
      await audit(
        AuditActionType.ADD,
        AuditTrasactionStatus.FAILURE,
        'postParticipants',
        'POST Participants: Invalid Alias Value - Alias Value should be a number',
        'RegistryEntity',
        {}, {alias_value}
      )
      return res.status(400).send(prepareError('Invalid Alias Value: Alias Value should be a number'))
    }
  }

  const newRegistryRecord = new RegistryEntity()
  newRegistryRecord.fspId = endpoint.fspId // TODO: Should be the FSP ID of registered API Accessed DFSP
  newRegistryRecord.dfsp_name = endpoint.dfsp_name
  newRegistryRecord.currency = currency
  newRegistryRecord.alias_value = paddedAliasValue

  // If alias_value is not provided by external DFSP, Mark the new record as head pointer
  if(alias_value == undefined || alias_value == null) {
    // Update the head pointer
    
    if(headPointerAliasValue) {
      // is_incremental_head false for the old head pointer
      headPointerAliasValue.is_incremental_head = false;
      await AppDataSource.manager.save(headPointerAliasValue);
    }
      
    newRegistryRecord.is_incremental_head = true;
  }

  await AppDataSource.manager.save(newRegistryRecord)

  await audit(
    AuditActionType.ADD,
    AuditTrasactionStatus.SUCCESS,
    'postParticipants',
    'POST Participants: Participant created',
    'RegistryEntity',
    {}, {fspId: endpoint.fspId, currency}
  )

  res.status(200).send({fspId: endpoint.fspId, currency, alias_value: paddedAliasValue})
})

export default router
