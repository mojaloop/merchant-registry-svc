/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import logger from '../../services/logger'
import { type AuthRequest } from 'src/types/express'
import { MojaloopDFSPEntity } from '../../entity/MojaloopDFSPEntity'
import { z } from 'zod'

// Define a Zod schema for the request body
const createMojaloopDFSPSchema = z.object({
    name: z.string(),
    fspId: z.string()
})

/**
 * @openapi
 * tags:
 *   name: DFSP
 *
 * /add-mojaloop-dfsp:
 *   post:
 *     tags:
 *       - DFSP
 *     security:
 *       - Authorization: []
 *     summary: POST add a new mojaloop DFSP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "DFSP Name"
 *                 description: "The display name of the dfsp"
 *               fspId:
 *                 type: string
 *                 example: "DFSP001"
 *                 description: "The FSP ID of the dfsp"
 *
 *     responses:
 *       201:
 *         description: Mojaloop DFSP successfully stored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The response message
 *                   example: Mojaloop  DFSP stored successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
export async function postAddMojaloopDfsp (req: AuthRequest, res: Response) {
    const parsedBody = createMojaloopDFSPSchema.safeParse(req.body)
    if (!parsedBody.success) {
        return res.status(400).send({
            message: 'Invalid request body', errors: parsedBody.error.formErrors.fieldErrors
        })
    }
    const { name, fspId } = parsedBody.data

    // Check for authenticated user
    /* istanbul ignore if */
    if (req.user === null || req.user === undefined) {
        return res.status(401).send({ message: 'Unauthorized' })
    }

    try {
        const DFSPRepository = AppDataSource.manager.getRepository(MojaloopDFSPEntity)

        // add  new mojaloop DFSP
        const newDFSP = new MojaloopDFSPEntity()
        newDFSP.dfsp_id = fspId
        newDFSP.dfsp_name = name
        // Save to database
        await DFSPRepository.save(newDFSP)

        logger.info(`mojaloop dfsp  stored: ${newDFSP.id}`)
        res.status(201).send({ message: 'Mojaloop DFSP stored successfully', data: newDFSP })
    } catch (e: any) /* istanbul ignore next */ {
        logger.error(`Error storing mojaloop DFSP: ${e as string}`)
        
        res.status(500).send({ message: 'Internal Server Error' })
    }
}
