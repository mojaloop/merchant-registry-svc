/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import { pdfUpload } from '../middleware/minioClient'
import { getMerchants } from './merchant-controllers/get-merchants'
import { getMerhcantById } from './merchant-controllers/get-merchant-by-id'
import { postMerchantDraft } from './merchant-controllers/post-merchant-draft'
import { putMerchantRegistrationStatus } from './merchant-controllers/put-merchant-reg-status'
import {
  putBulkMerchantRegistrationStatus
} from './merchant-controllers/put-merchants-bulk-reg-status'
import { putMerchantStatusReadyToReview } from './merchant-controllers/put-merchant-ready-to-review'
import { postMerchantLocation } from './merchant-controllers/post-merchant-location'
import { postMerchantContactPerson } from './merchant-controllers/post-merchant-contact-person'
import { postMerchantOwner } from './merchant-controllers/post-merchant-owner'
import { putMerchantDraft } from './merchant-controllers/put-merchant-draft'
import { putMerchantLocation } from './merchant-controllers/put-merchant-location'

const router = express.Router()

router.get('/merchants', getMerchants)

router.get('/merchants/:id', getMerhcantById)

router.post('/merchants/draft', pdfUpload.single('license_document'), postMerchantDraft)

router.put('/merchants/:id/draft', pdfUpload.single('license_document'), putMerchantDraft)

router.put('/merchants/:id/registration-status', putMerchantRegistrationStatus)

router.put('/merchants/registration-status', putBulkMerchantRegistrationStatus)

router.put('/merchants/:id/ready-to-review', putMerchantStatusReadyToReview)

router.post('/merchants/:id/locations', postMerchantLocation)

router.put('/merchants/:merchantId/locations/:locationId', putMerchantLocation)
router.post('/merchants/:id/contact-persons', postMerchantContactPerson)

router.post('/merchants/:id/business-owners', postMerchantOwner)

export default router
