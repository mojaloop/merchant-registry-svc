/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import logger from '../../services/logger'
import { type AuthRequest } from 'src/types/express'
import { DFSPOnboardEntity } from '../../entity/DFSPOnboardEntity'

/**
 * @openapi
 * tags:
 *   name: Onboard Dfsps
 *
 * /onboarded_dfsps:
 *   get:
 *     tags:
 *       - Onboard Dfsps
 *     security:
 *       - Authorization: []
 *     summary: GET ONBOARDED DFSP
 *     responses:
 *       200:
 *         description: GET Roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The response message
 *                   example: OK
 *                 data:
 *                   type: array
 *                   description: The response data
 *                   items:
 *                     type: object
 */

export async function getOnboardedDFPS (req: AuthRequest, res: Response) {
    const portalUser = req.user

    /* istanbul ignore if */
    if (portalUser == null) {
        return res.status(401).send({ message: 'Unauthorized' })
    }

    try {
        logger.debug('req.query: %o', req.query)

        const OnboardedDFSPRepository = AppDataSource.getRepository(DFSPOnboardEntity)

        const onboardedDfsps = await OnboardedDFSPRepository.find()

        res.send({ message: 'OK', data: onboardedDfsps })
    } catch (e) /* istanbul ignore next */ {
        logger.error(e)
        res.status(500).send({ message: e })
    }
}
