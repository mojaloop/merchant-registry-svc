/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Response } from 'express'
import { AppDataSource } from '../../database/dataSource'
import logger from '../../services/logger'
import { type AuthRequest } from 'src/types/express'
import { DFSPOnboardEntity } from '../../entity/DFSPOnboardEntity'
import { z } from 'zod'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import { audit } from '../../utils/audit'

// Define a Zod schema for the request body
const createOnboardDFSPSchema = z.object({
    name: z.string(),
    fspId: z.string(),
    license_number: z.string(),
    logoURI: z.string(),
    will_use_portal: z.string()
})


/**
 * @openapi
 * tags:
 *   name: Onboard Dfsps
 *
 * /onboard_dfsp:
 *   post:
 *     tags:
 *       - Onboard Dfsps
 *     security:
 *       - Authorization: []
 *     summary: POST Onboard  new DFSP
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
 *               license_number:
 *                 type: string
 *                 example: "DFSP licence Id"
 *                 description: "The licence number  of the dfsp"
 *               logoURI:
 *                 type: string
 *                 example: "https://picsum.photos/200/300"
 *                 description: "The logo URI of the dfsp"
 *               will_use_portal:
 *                 type: string
 *                 example: "yes"
 *                 description: "knowing if the dfsp will use portal"
 *
 *     responses:
 *       201:
 *         description: DFSP successfully onboarded
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


export async function postOnboardDFSP (req: AuthRequest, res: Response) {
    const parsedBody = createOnboardDFSPSchema.safeParse(req.body)
    if (!parsedBody.success) {
        return res.status(400).send({
            message: 'Invalid request body', errors: parsedBody.error.formErrors.fieldErrors
        })
    }
    const { name, fspId, license_number, logoURI, will_use_portal } = parsedBody.data

    // Check for authenticated user
    /* istanbul ignore if */
    if (req.user === null || req.user === undefined) {
        return res.status(401).send({ message: 'Unauthorized' })
    }

    try {
        const DFSPOnboardRepository = AppDataSource.manager.getRepository(DFSPOnboardEntity)

        // Check if DFSP is already onboarded
        const existingDFSP = await DFSPOnboardRepository.findOne({ where: { fspId } })
        if (existingDFSP) {
            return res.status(400).send({ message: 'DFSP is already onboarded' })
        }

        // Validate license_number is alphanumeric
        const alphanumericRegex = /^[a-zA-Z0-9]*$/
        if (!alphanumericRegex.test(license_number)) {
            return res.status(400).send({ message: 'License number should be alphanumeric' })
        }

        // onboard new DFSP
        const newOnboardedDFSP = new DFSPOnboardEntity()
        newOnboardedDFSP.name = name
        newOnboardedDFSP.fspId = fspId
        newOnboardedDFSP.license_number = license_number
        newOnboardedDFSP.logo_uri = logoURI
        newOnboardedDFSP.will_use_portal = will_use_portal


        // Save to database
        await  DFSPOnboardRepository .save(newOnboardedDFSP)

        await audit(
            AuditActionType.ADD,
            AuditTrasactionStatus.SUCCESS,
            'postOnboardDFSP',
            'DFSP onboarded successfully',
            'DFSPOnboardEntity',
            {}, {}, req.user
        )

        logger.info(`DFSP onboarded: ${newOnboardedDFSP .id}`)
        res.status(201).send({ message: 'DFSP onboarded successfully', data: newOnboardedDFSP  })
    } catch (e: any) /* istanbul ignore next */ {
        logger.error(`Error onboarding DFSP: ${e as string}`)

        await audit(
            AuditActionType.ADD,
            AuditTrasactionStatus.FAILURE,
            'postOnboardDFSP',
            `Error onboarding DFSP: ${e as string}`,
            'DFSPOnboardEntity',
            {}, {}, req.user
        )

        res.status(500).send({ message: 'Internal Server Error' })
    }
}
