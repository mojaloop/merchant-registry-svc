/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import logger from '../../services/logger'
import { type AuthRequest } from 'src/types/express'
import { DFSPEntity } from '../../entity/DFSPEntity'
import { generateApiKey } from '../../utils/utils'
import { audit } from '../../utils/audit'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { publishToQueue } from '../../services/messageQueue'

/**
 * @openapi
 * tags:
 *   name: DFSP
 *
 * /dfsps/{id}/client-access-key:
 *   post:
 *     tags:
 *       - DFSP
 *     security:
 *       - Authorization: []
 *     summary: POST Create a new DFSP Client Access Key
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: number
 *        required: true
 *        description: Numeric ID of the dfsp
 *     responses:
 *       201:
 *         description: DFSP successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The response message
 *                   example: DFSP created successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
export async function createClientAccessKey (req: AuthRequest, res: Response) {
  // Check for authenticated user
  if (req.user === null || req.user === undefined) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  if (req.params.id === null || req.params.id === undefined) {
    await audit(
      AuditActionType.UPDATE,
      AuditTrasactionStatus.SUCCESS,
      'createClientAccessKey',
      'DFSP ID is not provided.',
      'DFSPEntity',
      {}, {}, req.user
    )
    return res.status(400).send({ message: 'DFSP ID not provided' })
  }

  try {
    const clientSecretKey = generateApiKey()
    const DFSPRepository = AppDataSource.manager.getRepository(DFSPEntity)
    const dfsp = await DFSPRepository.findOneById(req.params.id)
    if (dfsp == null) {
      await audit(
        AuditActionType.UPDATE,
        AuditTrasactionStatus.SUCCESS,
        'createClientAccessKey',
        'DFSP ID: ' + req.params.id + ' not found.',
        'DFSPEntity',
        {}, {}, req.user
      )
      return res.status(400).send({ message: 'DFSP not found' })
    }

    dfsp.client_secret = clientSecretKey
    await DFSPRepository.save(dfsp)

    const DFSPMsgQueueData = {
      fspId: dfsp.fspId,
      dfsp_name: dfsp.name,
      client_secret: dfsp.client_secret
    }
    await publishToQueue({ command: 'registerEndpointDFSP', data: DFSPMsgQueueData })

    await audit(
      AuditActionType.UPDATE,
      AuditTrasactionStatus.SUCCESS,
      'createClientAccessKey',
      'Client Access Key Created for DFSP ID: ' + req.params.id,
      'DFSPEntity',
      {}, {}, req.user
    )

    res.status(201).send({
      message: 'DFSP Client Secret Key created successfully',
      data: clientSecretKey
    })
  } catch (e) {
    logger.error(`Error creating DFSP: ${e as string}`)
    await audit(
      AuditActionType.UPDATE,
      AuditTrasactionStatus.FAILURE,
      'createClientAccessKey',
      'Error creating Client Access Key for DFSP ID: ' + req.params.id,
      'DFSPEntity',
      {}, {}, req.user
    )
    res.status(500).send({ message: 'Internal Server Error' })
  }
}
