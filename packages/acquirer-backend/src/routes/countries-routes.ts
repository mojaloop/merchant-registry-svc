/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import { checkPermissionsOr } from '../middleware/check-permissions'
import { PermissionsEnum } from '../types/permissions'
import { authenticateJWT } from '../middleware/authenticate'
import { getCountries } from './country-controllers/get-countries'
import { getCountrySubdivisions } from './country-controllers/get-country-subdivisions'
import { getDistricts } from './country-controllers/get-country-subdiv-districts'

const router = express.Router()

router.get('/countries',
  authenticateJWT,
  checkPermissionsOr([PermissionsEnum.CREATE_MERCHANTS, PermissionsEnum.EDIT_MERCHANTS]),
  getCountries
)

router.get('/countries/:countryName/subdivisions',
  authenticateJWT,
  checkPermissionsOr([PermissionsEnum.CREATE_MERCHANTS, PermissionsEnum.EDIT_MERCHANTS]),
  getCountrySubdivisions
)

router.get('/countries/:countryName/subdivisions/:subdivisionName/districts',
  authenticateJWT,
  checkPermissionsOr([PermissionsEnum.CREATE_MERCHANTS, PermissionsEnum.EDIT_MERCHANTS]),
  getDistricts
)

export default router
