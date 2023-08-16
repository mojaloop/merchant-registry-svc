/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import { pdfUpload } from '../middleware/minioClient'
import { getMerchants } from './merchant-controllers/get-merchants'
import { getMerchantById } from './merchant-controllers/get-merchant-by-id'
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
import { getMerchantLocations } from './merchant-controllers/get-merchant-locations'
import { getMerchantCheckoutCounters } from './merchant-controllers/get-merchant-checkout-counters'
import { getMerchantDraftCountsByUser } from
  './merchant-controllers/get-merchant-draft-counts-by-user'
import { putMerchantOwner } from './merchant-controllers/put-merchant-owner'
import { putMerchantContactPerson } from './merchant-controllers/put-merchant-contact-person'
import { putWaitingAliasGeneration } from './merchant-controllers/put-merchant-approve'
import { putBulkWaitingAliasGeneration } from './merchant-controllers/put-merchant-approve-bulk'
import { putBulkReject } from './merchant-controllers/put-merchant-reject-bulk'

const router = express.Router()

router.get('/merchants', getMerchants)

router.get('/merchants/draft-counts', getMerchantDraftCountsByUser)

router.get('/merchants/:id', getMerchantById)

router.post('/merchants/draft', pdfUpload.single('license_document'), postMerchantDraft)

router.put('/merchants/:id/draft', pdfUpload.single('license_document'), putMerchantDraft)

router.put('/merchants/:id/registration-status', putMerchantRegistrationStatus)

router.put('/merchants/:id/approve', putWaitingAliasGeneration)

router.put('/merchants/bulk-approve', putBulkWaitingAliasGeneration)

router.put('/merchants/bulk-reject', putBulkReject)

router.put('/merchants/registration-status', putBulkMerchantRegistrationStatus)

router.put('/merchants/:id/ready-to-review', putMerchantStatusReadyToReview)

router.get('/merchants/:id/locations', getMerchantLocations)

router.post('/merchants/:id/locations', postMerchantLocation)

router.put('/merchants/:merchantId/locations/:locationId', putMerchantLocation)

router.post('/merchants/:id/contact-persons', postMerchantContactPerson)

router.put('/merchants/:merchantId/contact-persons/:contactPersonId', putMerchantContactPerson)

router.post('/merchants/:id/business-owners', postMerchantOwner)

router.put('/merchants/:merchantId/business-owners/:ownerId', putMerchantOwner)

router.get('/merchants/:id/checkout-counters', getMerchantCheckoutCounters)

export default router
