/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import logger from '../../services/logger'
import { type AuthRequest } from 'src/types/express'
import { DFSPEntity } from '../../entity/DFSPEntity'
import { z } from 'zod'
import { AuditActionType, AuditTrasactionStatus, DFSPType } from 'shared-lib'
import { audit } from '../../utils/audit'

// Define a Zod schema for the request body
const createDFSPSchema = z.object({
  name: z.string(),
  fspId: z.string(),
  dfspType: z.nativeEnum(DFSPType),
  joinedDate: z.string(),
  activated: z.boolean(),
  logoURI: z.string()
})
/**
 * @openapi
 * tags:
 *   name: DFSP
 *
 * /dfsps:
 *   post:
 *     tags:
 *       - DFSP
 *     security:
 *       - Authorization: []
 *     summary: POST Create a new DFSP
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
 *               dfspType:
 *                 type: string
 *                 example: "Other"
 *                 description: "The type of the dfsp"
 *               joinedDate:
 *                 type: string
 *                 example: "2021-01-01"
 *                 description: "The date the dfsp joined the hub"
 *                 format: date
 *                 pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"
 *               activated:
 *                 type: boolean
 *                 example: true
 *                 description: "Whether the dfsp is activated"
 *               logoURI:
 *                 type: string
 *                 example: "https://picsum.photos/200/300"
 *                 description: "The logo URI of the dfsp"
 *
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
export async function postCreateDFSP (req: AuthRequest, res: Response) {
  const parsedBody = createDFSPSchema.safeParse(req.body)
  if (!parsedBody.success) {
    return res.status(400).send({
      message: 'Invalid request body', errors: parsedBody.error.formErrors.fieldErrors
    })
  }
  const { name, fspId, dfspType, joinedDate, activated, logoURI } = parsedBody.data

  // Check for authenticated user
  if (req.user === null || req.user === undefined) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const DFSPRepository = AppDataSource.manager.getRepository(DFSPEntity)

    // Create new DFSP
    const newDFSP = new DFSPEntity()
    newDFSP.name = name
    newDFSP.fspId = fspId
    newDFSP.dfsp_type = dfspType
    newDFSP.joined_date = new Date(joinedDate)
    newDFSP.activated = activated
    newDFSP.logo_uri = logoURI

    // Save to database
    await DFSPRepository.save(newDFSP)

    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.SUCCESS,
      'postCreateDFSP',
      'DFSP created successfully',
      'DFSPEntity',
      {}, {}, req.user
    )

    logger.info(`DFSP created: ${newDFSP.id}`)
    res.status(201).send({ message: 'DFSP created successfully', data: newDFSP })
  } catch (e: any) {
    logger.error(`Error creating DFSP: ${e as string}`)

    await audit(
      AuditActionType.ADD,
      AuditTrasactionStatus.FAILURE,
      'postCreateDFSP',
      `Error creating DFSP: ${e as string}`,
      'DFSPEntity',
      {}, {}, req.user
    )

    res.status(500).send({ message: 'Internal Server Error' })
  }
}
