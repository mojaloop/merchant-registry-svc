/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-named-as-default */
import axios, { isAxiosError } from 'axios'
import logger from './logger'
import SubdivisionMappingService from './SubdivisionMappingService'

export interface GLEIFResponse {
  data: Array<{
    id: string
    type: string
    attributes: {
      lei: string
      entity: {
        legalName: {
          name: string
        }
        legalAddress: {
          language?: string
          addressLines?: string[]
          addressNumber?: string | null
          addressNumberWithinBuilding?: string | null
          mailRouting?: string | null
          city?: string
          region?: string
          country: string
          postalCode?: string
        }
        headquartersAddress: {
          language?: string
          addressLines?: string[]
          addressNumber?: string | null
          addressNumberWithinBuilding?: string | null
          mailRouting?: string | null
          city?: string
          region?: string
          country: string
          postalCode?: string
        }
        businessRegisterEntityID: {
          id: string
        }
      }
      registration: {
        initialRegistrationDate: string
        lastUpdateDate: string
        status: string
        nextRenewalDate: string
      }
    }
  }>
}

export interface LEIValidationResult {
  isValid: boolean
  entityName?: string
  country?: string
  status?: string
  error?: string
}

// Country code mapping
const COUNTRY_CODE_MAP: Record<string, string> = {
  AD: 'Andorra',
  AE: 'United Arab Emirates',
  AF: 'Afghanistan',
  AG: 'Antigua and Barbuda',
  AI: 'Anguilla',
  AL: 'Albania',
  AM: 'Armenia',
  AO: 'Angola',
  AQ: 'Antarctica',
  AR: 'Argentina',
  AS: 'American Samoa',
  AT: 'Austria',
  AU: 'Australia',
  AW: 'Aruba',
  AX: 'Åland Islands',
  AZ: 'Azerbaijan',
  BA: 'Bosnia and Herzegovina',
  BB: 'Barbados',
  BD: 'Bangladesh',
  BE: 'Belgium',
  BF: 'Burkina Faso',
  BG: 'Bulgaria',
  BH: 'Bahrain',
  BI: 'Burundi',
  BJ: 'Benin',
  BL: 'Saint Barthélemy',
  BM: 'Bermuda',
  BN: 'Brunei Darussalam',
  BO: 'Bolivia',
  BQ: 'Bonaire, Sint Eustatius and Saba',
  BR: 'Brazil',
  BS: 'Bahamas',
  BT: 'Bhutan',
  BV: 'Bouvet Island',
  BW: 'Botswana',
  BY: 'Belarus',
  BZ: 'Belize',
  CA: 'Canada',
  CC: 'Cocos (Keeling) Islands',
  CD: 'Congo, Democratic Republic of the',
  CF: 'Central African Republic',
  CG: 'Congo',
  CH: 'Switzerland',
  CI: 'Côte d\'Ivoire',
  CK: 'Cook Islands',
  CL: 'Chile',
  CM: 'Cameroon',
  CN: 'China',
  CO: 'Colombia',
  CR: 'Costa Rica',
  CU: 'Cuba',
  CV: 'Cabo Verde',
  CW: 'Curaçao',
  CX: 'Christmas Island',
  CY: 'Cyprus',
  CZ: 'Czechia',
  DE: 'Germany',
  DJ: 'Djibouti',
  DK: 'Denmark',
  DM: 'Dominica',
  DO: 'Dominican Republic',
  DZ: 'Algeria',
  EC: 'Ecuador',
  EE: 'Estonia',
  EG: 'Egypt',
  EH: 'Western Sahara',
  ER: 'Eritrea',
  ES: 'Spain',
  ET: 'Ethiopia',
  FI: 'Finland',
  FJ: 'Fiji',
  FK: 'Falkland Islands (Malvinas)',
  FM: 'Micronesia, Federated States of',
  FO: 'Faroe Islands',
  FR: 'France',
  GA: 'Gabon',
  GB: 'United Kingdom',
  GD: 'Grenada',
  GE: 'Georgia',
  GF: 'French Guiana',
  GG: 'Guernsey',
  GH: 'Ghana',
  GI: 'Gibraltar',
  GL: 'Greenland',
  GM: 'Gambia',
  GN: 'Guinea',
  GP: 'Guadeloupe',
  GQ: 'Equatorial Guinea',
  GR: 'Greece',
  GS: 'South Georgia and the South Sandwich Islands',
  GT: 'Guatemala',
  GU: 'Guam',
  GW: 'Guinea-Bissau',
  GY: 'Guyana',
  HK: 'Hong Kong',
  HM: 'Heard Island and McDonald Islands',
  HN: 'Honduras',
  HR: 'Croatia',
  HT: 'Haiti',
  HU: 'Hungary',
  ID: 'Indonesia',
  IE: 'Ireland',
  IL: 'Israel',
  IM: 'Isle of Man',
  IN: 'India',
  IO: 'British Indian Ocean Territory',
  IQ: 'Iraq',
  IR: 'Iran, Islamic Republic of',
  IS: 'Iceland',
  IT: 'Italy',
  JE: 'Jersey',
  JM: 'Jamaica',
  JO: 'Jordan',
  JP: 'Japan',
  KE: 'Kenya',
  KG: 'Kyrgyzstan',
  KH: 'Cambodia',
  KI: 'Kiribati',
  KM: 'Comoros',
  KN: 'Saint Kitts and Nevis',
  KP: 'Korea, Democratic People\'s Republic of',
  KR: 'Korea, Republic of',
  KW: 'Kuwait',
  KY: 'Cayman Islands',
  KZ: 'Kazakhstan',
  LA: 'Lao People\'s Democratic Republic',
  LB: 'Lebanon',
  LC: 'Saint Lucia',
  LI: 'Liechtenstein',
  LK: 'Sri Lanka',
  LR: 'Liberia',
  LS: 'Lesotho',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  LV: 'Latvia',
  LY: 'Libya',
  MA: 'Morocco',
  MC: 'Monaco',
  MD: 'Moldova, Republic of',
  ME: 'Montenegro',
  MF: 'Saint Martin (French part)',
  MG: 'Madagascar',
  MH: 'Marshall Islands',
  MK: 'North Macedonia',
  ML: 'Mali',
  MM: 'Myanmar',
  MN: 'Mongolia',
  MO: 'Macao',
  MP: 'Northern Mariana Islands',
  MQ: 'Martinique',
  MR: 'Mauritania',
  MS: 'Montserrat',
  MT: 'Malta',
  MU: 'Mauritius',
  MV: 'Maldives',
  MW: 'Malawi',
  MX: 'Mexico',
  MY: 'Malaysia',
  MZ: 'Mozambique',
  NA: 'Namibia',
  NC: 'New Caledonia',
  NE: 'Niger',
  NF: 'Norfolk Island',
  NG: 'Nigeria',
  NI: 'Nicaragua',
  NL: 'Netherlands',
  NO: 'Norway',
  NP: 'Nepal',
  NR: 'Nauru',
  NU: 'Niue',
  NZ: 'New Zealand',
  OM: 'Oman',
  PA: 'Panama',
  PE: 'Peru',
  PF: 'French Polynesia',
  PG: 'Papua New Guinea',
  PH: 'Philippines',
  PK: 'Pakistan',
  PL: 'Poland',
  PM: 'Saint Pierre and Miquelon',
  PN: 'Pitcairn',
  PR: 'Puerto Rico',
  PS: 'Palestine, State of',
  PT: 'Portugal',
  PW: 'Palau',
  PY: 'Paraguay',
  QA: 'Qatar',
  RE: 'Réunion',
  RO: 'Romania',
  RS: 'Serbia',
  RU: 'Russian Federation',
  RW: 'Rwanda',
  SA: 'Saudi Arabia',
  SB: 'Solomon Islands',
  SC: 'Seychelles',
  SD: 'Sudan',
  SE: 'Sweden',
  SG: 'Singapore',
  SH: 'Saint Helena, Ascension and Tristan da Cunha',
  SI: 'Slovenia',
  SJ: 'Svalbard and Jan Mayen',
  SK: 'Slovakia',
  SL: 'Sierra Leone',
  SM: 'San Marino',
  SN: 'Senegal',
  SO: 'Somalia',
  SR: 'Suriname',
  SS: 'South Sudan',
  ST: 'Sao Tome and Principe',
  SV: 'El Salvador',
  SX: 'Sint Maarten (Dutch part)',
  SY: 'Syrian Arab Republic',
  SZ: 'Eswatini',
  TC: 'Turks and Caicos Islands',
  TD: 'Chad',
  TF: 'French Southern Territories',
  TG: 'Togo',
  TH: 'Thailand',
  TJ: 'Tajikistan',
  TK: 'Tokelau',
  TL: 'Timor-Leste',
  TM: 'Turkmenistan',
  TN: 'Tunisia',
  TO: 'Tonga',
  TR: 'Turkey',
  TT: 'Trinidad and Tobago',
  TV: 'Tuvalu',
  TW: 'Taiwan, Province of China',
  TZ: 'Tanzania, United Republic of',
  UA: 'Ukraine',
  UG: 'Uganda',
  UM: 'United States Minor Outlying Islands',
  US: 'United States of America',
  UY: 'Uruguay',
  UZ: 'Uzbekistan',
  VA: 'Holy See (Vatican City State)',
  VC: 'Saint Vincent and the Grenadines',
  VE: 'Venezuela, Bolivarian Republic of',
  VG: 'Virgin Islands, British',
  VI: 'Virgin Islands, U.S.',
  VN: 'Viet Nam',
  VU: 'Vanuatu',
  WF: 'Wallis and Futuna',
  WS: 'Samoa',
  YE: 'Yemen',
  YT: 'Mayotte',
  ZA: 'South Africa',
  ZM: 'Zambia',
  ZW: 'Zimbabwe'
}

// Create reverse mapping for full country names to ISO codes
const REVERSE_COUNTRY_CODE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_CODE_MAP).map(([code, name]) => [name.toLowerCase(), code])
)

// REST Countries API interface
interface RestCountriesResponse {
  name: {
    common: string
    official: string
  }
  cca2: string // ISO 3166-1 alpha-2
  cca3: string // ISO 3166-1 alpha-3
  region: string
  subregion?: string
}

// Cache for REST Countries API responses to avoid repeated calls
const countryCache = new Map<string, RestCountriesResponse>()
const regionCache = new Map<string, string[]>()

export class GLEIFService {
  private readonly baseUrl: string
  private readonly apiKey?: string

  constructor () {
    this.baseUrl = process.env.GLEIF_API_URL ?? 'https://api.gleif.org/api/v1'
    this.apiKey = process.env.GLEIF_API_KEY
  }

  /**
   * Converts ISO 3166-1 alpha-2 country code to full country name
   * @param countryCode - ISO country code (e.g., 'LU')
   * @returns Full country name (e.g., 'Luxembourg') or the original code if not found
   */
  private convertCountryCodeToName (countryCode: string): string {
    return COUNTRY_CODE_MAP[countryCode] || countryCode
  }

  /**
   * Converts full country name to ISO 3166-1 alpha-2 country code
   * @param countryName - Full country name (e.g., 'Luxembourg')
   * @returns ISO country code (e.g., 'LU') or the original name if not found
   */
  private convertCountryNameToCode (countryName: string): string {
    return REVERSE_COUNTRY_CODE_MAP[countryName.toLowerCase()] || countryName
  }

  /**
   * Fetches country information from REST Countries API
   * @param countryCode - ISO 3166-1 alpha-2 country code
   * @returns Promise<RestCountriesResponse | null>
   */
  private async fetchCountryInfo (countryCode: string): Promise<RestCountriesResponse | null> {
    try {
      // Check cache first
      if (countryCache.has(countryCode)) {
        return countryCache.get(countryCode) || null
      }

      const response = await axios.get<RestCountriesResponse[]>(
        `https://restcountries.com/v3.1/alpha/${countryCode}`,
        { timeout: 5000 }
      )

      if (response.data && response.data.length > 0) {
        const countryData = response.data[0]
        countryCache.set(countryCode, countryData)
        return countryData
      }

      return null
    } catch (error) {
      logger.warn('Failed to fetch country info from REST Countries API: %o', error)
      return null
    }
  }

  /**
   * Compares two country values, handling both ISO codes and full names
   * Uses both local mapping and REST Countries API for validation
   * @param country1 - First country (can be ISO code or full name)
   * @param country2 - Second country (can be ISO code or full name)
   * @returns Promise<boolean>
   */
  private async compareCountries (country1: string, country2: string): Promise<boolean> {
    const c1Lower = country1.toLowerCase().trim()
    const c2Lower = country2.toLowerCase().trim()

    // Direct match
    if (c1Lower === c2Lower) {
      return true
    }

    // Try local mapping first (faster)
    const c1AsName = this.convertCountryCodeToName(country1).toLowerCase()
    if (c1AsName === c2Lower) {
      return true
    }

    const c2AsName = this.convertCountryCodeToName(country2).toLowerCase()
    if (c1Lower === c2AsName) {
      return true
    }

    const c1AsCode = this.convertCountryNameToCode(country1).toLowerCase()
    const c2AsCode = this.convertCountryNameToCode(country2).toLowerCase()
    if (c1AsCode === c2AsCode) {
      return true
    }

    // If local mapping fails, try REST Countries API
    try {
      // Assume country2 is the GLEIF code (more likely to be ISO format)
      const countryInfo = await this.fetchCountryInfo(country2)
      if (countryInfo) {
        const officialName = countryInfo.name.official.toLowerCase()
        const commonName = countryInfo.name.common.toLowerCase()

        if (c1Lower === officialName || c1Lower === commonName) {
          return true
        }
      }

      // Try the other way around
      const countryInfo2 = await this.fetchCountryInfo(country1)
      if (countryInfo2) {
        const officialName2 = countryInfo2.name.official.toLowerCase()
        const commonName2 = countryInfo2.name.common.toLowerCase()

        if (c2Lower === officialName2 || c2Lower === commonName2) {
          return true
        }
      }
    } catch (error) {
      logger.warn('Error during dynamic country comparison: %o', error)
    }

    return false
  }

  /**
   * Fetches all subdivisions (states/provinces/regions) for a country from REST Countries API
   * @param countryCode - ISO 3166-1 alpha-2 country code
   * @returns Promise<string[]> - Array of subdivision names
   */
  private async fetchCountrySubdivisions (countryCode: string): Promise<string[]> {
    try {
      // Check cache first
      const cacheKey = `subdivisions_${countryCode}`
      if (regionCache.has(cacheKey)) {
        return regionCache.get(cacheKey) || []
      }

      // Use a more comprehensive API for subdivisions
      const response = await axios.get(
        `https://restcountries.com/v3.1/alpha/${countryCode}?fields=name,subdivisions`,
        { timeout: 5000 }
      )

      let subdivisions: string[] = []
      if (response.data?.subdivisions) {
        subdivisions = Object.values(response.data.subdivisions).map((sub: any) => sub.name)
      }

      // If REST Countries doesn't have subdivisions, try an alternative approach
      // by fetching from a comprehensive country data API
      if (subdivisions.length === 0) {
        try {
          const altResponse = await axios.get(
            `https://api.worldbank.org/v2/country/${countryCode}/region?format=json`,
            { timeout: 3000 }
          )
          if (altResponse.data?.[1] && altResponse.data[1].length > 0) {
            subdivisions = altResponse.data[1].map((item: any) => item.name)
          }
        } catch (altError) {
          logger.debug('Alternative subdivision API failed: %o', altError)
        }
      }

      regionCache.set(cacheKey, subdivisions)
      return subdivisions
    } catch (error) {
      logger.warn('Failed to fetch subdivisions from API: %o', error)
      return []
    }
  }

  /**
   * Compares region/subdivision values with enhanced API-based validation
   * Uses SubdivisionMappingService to handle name/code conversions
   * @param region1 - First region (from merchant data)
   * @param region2 - Second region (from GLEIF data)
   * @param countryCode - Country code to help resolve subdivisions
   * @returns Promise<boolean>
   */
  private async compareRegions (region1: string, region2: string, countryCode?: string): Promise<boolean> {
    if (!countryCode) {
      // Fallback to simple comparison if no country code
      const r1Lower = region1.toLowerCase().trim()
      const r2Lower = region2.toLowerCase().trim()
      return r1Lower === r2Lower || r1Lower.includes(r2Lower) || r2Lower.includes(r1Lower)
    }

    try {
      // Use the subdivision mapping service for enhanced comparison
      const comparisonResult = SubdivisionMappingService.compareSubdivisions(
        region1,
        region2,
        countryCode
      )

      logger.debug('Region comparison result: "%s" vs "%s" (country: %s) - isMatch: %s, confidence: %.2f, normalized: "%s" vs "%s"',
        region1, region2, countryCode, comparisonResult.isMatch, comparisonResult.confidence,
        comparisonResult.normalizedValue1, comparisonResult.normalizedValue2
      )

      // Accept matches with confidence >= 0.5 (lowered threshold for better matching)
      if (comparisonResult.isMatch && comparisonResult.confidence >= 0.5) {
        logger.info('Region match found: "%s" matches "%s" (confidence: %.2f) - normalized to "%s" and "%s"',
          region1, region2, comparisonResult.confidence,
          comparisonResult.normalizedValue1, comparisonResult.normalizedValue2
        )
        return true
      }

      // Log potential matches with lower confidence for monitoring
      if (comparisonResult.confidence > 0.2) {
        logger.warn('Low confidence region match - may need manual review: "%s" vs "%s" (confidence: %.2f, country: %s)',
          region1, region2, comparisonResult.confidence, countryCode
        )
      }

      return false
    } catch (error) {
      logger.warn('Error during subdivision comparison for %s: %o', countryCode, error)

      // Fallback to simple comparison
      const r1Lower = region1.toLowerCase().trim()
      const r2Lower = region2.toLowerCase().trim()
      return r1Lower === r2Lower || r1Lower.includes(r2Lower) || r2Lower.includes(r1Lower)
    }
  }

  /**
   * Validates a LEI number using the GLEIF API
   * @param lei - The LEI number to validate
   * @returns Promise<LEIValidationResult>
   */
  async validateLEI (lei: string, name: string): Promise<LEIValidationResult> {
    try {
      // Basic LEI format validation (20 characters, alphanumeric)
      if (lei === null || lei === undefined || lei === '' || lei.length !== 20 || !/^[A-Z0-9]{20}$/.test(lei)) {
        return {
          isValid: false,
          error: 'Invalid LEI format. LEI must be exactly 20 alphanumeric characters.'
        }
      }

      const headers: Record<string, string> = {
        Accept: 'application/vnd.api+json'
      }

      if (this.apiKey) {
        headers.Authorization = `Bearer ${this.apiKey}`
      }

      const response = await axios.get<GLEIFResponse>(
        `${this.baseUrl}/lei-records?filter[lei]=${lei}`,
        { headers }
      )

      if (response.data.data && response.data.data.length > 0) {
        const leiRecord = response.data.data[0]
        const attributes = leiRecord.attributes
        const legalName = attributes.entity.legalName.name

        // console.log(legalName)
        // 🔍 Check if provided name matches the legal name from GLEIF
        if (name.trim().toLowerCase() !== legalName.trim().toLowerCase()) {
          return {
            isValid: false,
            error: `Provided entity name "${name}" does not match registered legal name "${legalName}" from GLEIF`
          }
        }

        // Convert GLEIF country code to full country name for Mojaloop compatibility
        const countryCode = attributes.entity.legalAddress.country || attributes.entity.headquartersAddress.country
        const countryName = this.convertCountryCodeToName(countryCode)

        return {
          isValid: true,
          entityName: legalName,
          country: countryName,
          status: attributes.registration.status
        }
      } else {
        return {
          isValid: false,
          error: 'LEI not found in GLEIF database'
        }
      }
    } catch (error) {
      logger.error('GLEIF API error: %o', error)

      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return {
            isValid: false,
            error: 'LEI not found in GLEIF database'
          }
        }
        if (error.response?.status === 429) {
          return {
            isValid: false,
            error: 'GLEIF API rate limit exceeded. Please try again later.'
          }
        }
        if (error.response?.status === 401 || error.response?.status === 403) {
          return {
            isValid: false,
            error: 'GLEIF API authentication failed'
          }
        }
      }

      return {
        isValid: false,
        error: 'Failed to validate LEI. Please try again later.'
      }
    }
  }

  /**
   * Validates a LEI entity's location details using the GLEIF API
   * @param lei - The LEI number
   * @param street_name
   * @param building_number
   * @param postal_code
   * @param town_name
   * @param country_subdivision
   * @param country
   * @param address_line
   * @returns Promise<LEIValidationResult>
   */
  async validateLocation (
    lei: string,
    street_name?: string,
    building_number?: string,
    postal_code?: string,
    town_name?: string,
    country_subdivision?: string,
    country?: string,
    address_line?: string
  ): Promise<LEIValidationResult> {
    try {
      // Basic LEI format validation
      if (lei === null || lei === undefined || lei === '' || lei.length !== 20 || !/^[A-Z0-9]{20}$/.test(lei)) {
        return {
          isValid: false,
          error: 'Invalid LEI format. LEI must be exactly 20 alphanumeric characters.'
        }
      }

      const headers: Record<string, string> = {
        Accept: 'application/vnd.api+json'
      }

      const response = await axios.get<GLEIFResponse>(
        `${this.baseUrl}/lei-records?filter[lei]=${lei}`,
        { headers }
      )

      if (!response.data.data || response.data.data.length === 0) {
        return {
          isValid: false,
          error: 'LEI not found in GLEIF database'
        }
      }

      const attributes = response.data.data[0].attributes
      const legalAddress = attributes.entity.legalAddress

      // Mapping expected values from GLEIF API response
      const expected = {
        street_name: legalAddress.addressLines?.[0] || '',
        building_number: legalAddress.addressNumber || '',
        postal_code: legalAddress.postalCode || '',
        town_name: legalAddress.city || '',
        country_subdivision: legalAddress.region || '',
        country: legalAddress.country,
        address_line: legalAddress.addressLines?.[1] || legalAddress.mailRouting || ''
      }

      // Compare provided values with GLEIF data
      const mismatches: string[] = []
      const warnings: string[] = []

      if (street_name && street_name.trim().toLowerCase() !== (expected.street_name ?? '').trim().toLowerCase()) {
        mismatches.push(`Street name mismatch: provided "${street_name}", expected "${expected.street_name}"`)
      }
      if (building_number && building_number.trim().toLowerCase() !== (expected.building_number ?? '').trim().toLowerCase()) {
        mismatches.push(`Building number mismatch: provided "${building_number}", expected "${expected.building_number}"`)
      }
      if (postal_code && postal_code.trim().toLowerCase() !== (expected.postal_code ?? '').trim().toLowerCase()) {
        mismatches.push(`Postal code mismatch: provided "${postal_code}", expected "${expected.postal_code}"`)
      }
      if (town_name && town_name.trim().toLowerCase() !== (expected.town_name ?? '').trim().toLowerCase()) {
        mismatches.push(`Town name mismatch: provided "${town_name}", expected "${expected.town_name}"`)
      }

      // Handle country subdivision (region) with enhanced API validation
      if (country_subdivision && expected.country_subdivision &&
          !(await this.compareRegions(country_subdivision, expected.country_subdivision, expected.country))) {
        // Get suggestions for better error messaging
        const suggestions = SubdivisionMappingService.getSuggestions(
          country_subdivision,
          expected.country,
          3
        )

        const expectedCountryName = this.convertCountryCodeToName(expected.country)
        let errorMessage = `Country subdivision mismatch: provided "${country_subdivision}", expected "${expected.country_subdivision}" (in ${expectedCountryName})`

        // Add suggestions if available
        if (suggestions.length > 0) {
          const suggestionText = suggestions
            .map(s => `"${s.name}" (${s.code})`)
            .join(', ')
          errorMessage += `. Did you mean: ${suggestionText}?`
        }

        mismatches.push(errorMessage)
      }

      // Handle country validation with dynamic API support
      if (country && !(await this.compareCountries(country, expected.country))) {
        const expectedCountryName = this.convertCountryCodeToName(expected.country)
        const providedCountryCode = this.convertCountryNameToCode(country)

        let errorMessage = `Country mismatch: provided "${country}"`
        if (providedCountryCode !== country) {
          errorMessage += ` (${providedCountryCode})`
        }
        errorMessage += `, expected "${expectedCountryName}"`
        if (expected.country !== expectedCountryName) {
          errorMessage += ` (${expected.country})`
        }

        mismatches.push(errorMessage)
      }

      if (address_line && address_line.trim().toLowerCase() !== (expected.address_line ?? '').trim().toLowerCase()) {
        mismatches.push(`Address line mismatch: provided "${address_line}", expected "${expected.address_line}"`)
      }

      // Log warnings if any
      if (warnings.length > 0) {
        logger.warn('Location validation warnings: %s', warnings.join('; '))
      }

      if (mismatches.length > 0) {
        return {
          isValid: false,
          error: mismatches.join('; ')
        }
      }

      // Convert GLEIF country code to full country name for Mojaloop compatibility
      const countryName = this.convertCountryCodeToName(legalAddress.country)

      return {
        isValid: true,
        entityName: attributes.entity.legalName.name,
        country: countryName,
        status: attributes.registration.status
      }
    } catch (error) {
      logger.error('GLEIF API error (location validation): %o', error)

      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          return {
            isValid: false,
            error: 'LEI not found in GLEIF database'
          }
        }
        if (error.response?.status === 429) {
          return {
            isValid: false,
            error: 'GLEIF API rate limit exceeded. Please try again later.'
          }
        }
        if (error.response?.status === 401 || error.response?.status === 403) {
          return {
            isValid: false,
            error: 'GLEIF API authentication failed'
          }
        }
      }

      return {
        isValid: false,
        error: 'Failed to validate LEI location. Please try again later.'
      }
    }
  }

  /**
   * Checks if the GLEIF service is properly configured
   * @returns boolean
   */
  isConfigured (): boolean {
    return !!this.baseUrl
  }
}

export const gleifService = new GLEIFService()
