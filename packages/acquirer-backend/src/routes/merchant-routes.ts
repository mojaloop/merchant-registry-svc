/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import { pdfUpload } from '../services/minioClient'
import { getMerchants } from './merchant-controllers/get-merchants'
import { getMerchantById } from './merchant-controllers/get-merchant-by-id'
import { postMerchantDraft } from './merchant-controllers/post-merchant-draft'
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
import { exportMerchantIdsXlsx } from './merchant-controllers/get-merchant-export-ids-xlsx'
import { putBulkWaitingAliasGeneration } from './merchant-controllers/put-merchant-approve-bulk'
import { putBulkReject } from './merchant-controllers/put-merchant-reject-bulk'
import { putBulkRevert } from './merchant-controllers/put-merchant-revert-bulk'
import { exportMerchantFilterXlsx } from './merchant-controllers/get-merchant-export-filter-xlsx'
import { authenticateJWT } from '../middleware/authenticate'

const router = express.Router()

router.get('/merchants', authenticateJWT, getMerchants)

router.get('/merchants/draft-counts', authenticateJWT, getMerchantDraftCountsByUser)

router.get('/merchants/export-with-ids', authenticateJWT, exportMerchantIdsXlsx)

router.get('/merchants/export-with-filter', authenticateJWT, exportMerchantFilterXlsx)

router.post('/merchants/draft',
  authenticateJWT,
  pdfUpload.single('license_document'),
  postMerchantDraft
)

router.get('/merchants/:id', authenticateJWT, getMerchantById)

router.put('/merchants/:id/draft',
  authenticateJWT,
  pdfUpload.single('license_document'),
  putMerchantDraft
)

router.put('/merchants/:id/approve', authenticateJWT, putWaitingAliasGeneration)

router.put('/merchants/bulk-approve', authenticateJWT, putBulkWaitingAliasGeneration)

router.put('/merchants/bulk-reject', authenticateJWT, putBulkReject)

router.put('/merchants/bulk-revert', authenticateJWT, putBulkRevert)

router.put('/merchants/:id/ready-to-review', authenticateJWT, putMerchantStatusReadyToReview)

router.get('/merchants/:id/locations', authenticateJWT, getMerchantLocations)

router.post('/merchants/:id/locations', authenticateJWT, postMerchantLocation)

router.put('/merchants/:merchantId/locations/:locationId', authenticateJWT, putMerchantLocation)

router.post('/merchants/:id/contact-persons', authenticateJWT, postMerchantContactPerson)

router.put('/merchants/:merchantId/contact-persons/:contactPersonId',
  authenticateJWT,
  putMerchantContactPerson
)

router.post('/merchants/:id/business-owners', authenticateJWT, postMerchantOwner)

router.put('/merchants/:merchantId/business-owners/:ownerId', authenticateJWT, putMerchantOwner)

router.get('/merchants/:id/checkout-counters', authenticateJWT, getMerchantCheckoutCounters)

export default router
