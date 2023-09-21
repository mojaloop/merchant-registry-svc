import express, { type Request, type Response } from 'express'
import {AuditActionType, AuditTrasactionStatus} from 'shared-lib'
import logger from '../services/logger'
import {audit} from '../utils/audit'

const router = express.Router()
router.get('/participants/:type/:id', async (req: Request, res: Response) => {
  const {type, id} = req.params 

  if(type == undefined || type == null) {
    logger.error('Invalid Type')
    await audit(
      AuditActionType.ACCESS, 
      AuditTrasactionStatus.FAILURE, 
      'getParticipants',
      'GET Participants: Invalid Type', 
      'RegistryEntity',
      {}, {type}
    )
    return res.status(422).send({ message: 'Invalid Type' })
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
    return res.status(422).send({ message: 'Invalid ID' })
  }

  // TODO:

})

export default router
