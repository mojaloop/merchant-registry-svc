import iso31662 from 'iso-3166-2'
import countries from 'i18n-iso-countries'
import logger from './logger'

// Register English locale for country names
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

interface SubdivisionInfo {
  code: string
  name: string
  type?: string
}

/**
 * Converts a human-readable subdivision name to ISO 3166-2 format
 * @param subdivisionName - Human readable name (e.g., "Ontario")
 * @param countryCode - ISO country code
 * @returns ISO 3166-2 code (e.g., "CA-ON") or null
 */
export function nameToCode (subdivisionName: string, countryCode: string): string | null {
  if (subdivisionName === '' || subdivisionName === null || subdivisionName === undefined ||
        countryCode === '' || countryCode === null || countryCode === undefined) {
    return null
  }

  try {
    const subdivisions = getSubdivisions(countryCode)
    if (subdivisions === null || subdivisions === undefined) return null

    const nameToFind = subdivisionName.trim().toLowerCase()

    // Try exact match first
    const exactMatch = findExactMatch(subdivisions, nameToFind)
    if (exactMatch !== null && exactMatch !== undefined) return exactMatch

    // Try fuzzy matching for common variations
    return findFuzzyMatch(subdivisions, nameToFind)
  } catch (error) {
    logger.debug('Error converting subdivision name to code: %o', error)
    return null
  }
}

/**
   * Get subdivisions data for a country
   * @param countryCode - ISO country code
   * @returns Subdivisions object or null
   */
function getSubdivisions (countryCode: string): Record<string, SubdivisionInfo> | null {
  const countryData = (iso31662 as any).data[countryCode.toUpperCase()]
  return countryData?.sub ?? null
}

/**
   * Find exact match for subdivision name
   * @param subdivisions - Subdivisions data
   * @param nameToFind - Name to search for
   * @returns Subdivision code or null
   */
function findExactMatch (
  subdivisions: Record<string, SubdivisionInfo>,
  nameToFind: string
): string | null {
  for (const [subCode, subData] of Object.entries(subdivisions)) {
    const subdivision = subData
    if (subdivision.name !== undefined && subdivision.name !== null && subdivision.name.toLowerCase() === nameToFind) {
      return subCode
    }
  }
  return null
}

/**
   * Find fuzzy match for subdivision name
   * @param subdivisions - Subdivisions data
   * @param nameToFind - Name to search for
   * @returns Subdivision code or null
   */
function findFuzzyMatch (
  subdivisions: Record<string, SubdivisionInfo>,
  nameToFind: string
): string | null {
  const cleanSearchName = cleanName(nameToFind)

  for (const [subCode, subData] of Object.entries(subdivisions)) {
    const subdivision = subData
    if (subdivision.name === undefined || subdivision.name === null || subdivision.name === '') continue

    const subName = subdivision.name.toLowerCase()
    const cleanSubName = cleanName(subName)

    // Check if names match after removing common words
    if (cleanSubName === cleanSearchName) {
      return subCode
    }

    // Check partial matches for longer names
    if (isPartialMatch(subName, nameToFind)) {
      return subCode
    }
  }
  return null
}

/**
   * Check if two names are a partial match
   * @param subName - Subdivision name from database
   * @param nameToFind - Name being searched for
   * @returns True if partial match
   */
function isPartialMatch (subName: string, nameToFind: string): boolean {
  const hasSubstring = subName.includes(nameToFind) || nameToFind.includes(subName)
  const lengthDiff = Math.abs(subName.length - nameToFind.length)
  return hasSubstring && lengthDiff <= 3
}

/**
 * Converts an ISO 3166-2 code to human-readable name
 * @param subdivisionCode - ISO code (e.g., "CA-ON")
 * @returns Human readable name (e.g., "Ontario") or null
 */
export function codeToName (subdivisionCode: string): string | null {
  if (subdivisionCode === '' || subdivisionCode === null || subdivisionCode === undefined) return null

  try {
    const parts = subdivisionCode.split('-')
    if (parts.length !== 2) return null

    const [countryCode, subCode] = parts
    const subdivision = iso31662.subdivision(countryCode, subCode)

    return subdivision?.name ?? null
  } catch (error) {
    logger.debug('Error converting subdivision code to name: %o', error)
    return null
  }
}

/**
 * Enhanced comparison between subdivision values
 * @param subdivision1 - First subdivision (can be name or code)
 * @param subdivision2 - Second subdivision (can be name or code)
 * @param countryCode - Country code for context
 * @returns Match result with confidence score
 */
export function compareSubdivisions (
  subdivision1: string,
  subdivision2: string,
  countryCode: string
): {
    isMatch: boolean
    normalizedValue1?: string
    normalizedValue2?: string
    confidence: number
  } {
  const s1 = subdivision1.trim()
  const s2 = subdivision2.trim()

  // Direct match (highest confidence)
  const directMatch = checkDirectMatch(s1, s2)
  if (directMatch !== null && directMatch !== undefined) return directMatch

  try {
    // Try ISO code comparison
    const codeComparison = compareISOCodes(s1, s2, countryCode)
    if (codeComparison !== null && codeComparison !== undefined) return codeComparison

    // Try fuzzy name matching
    const fuzzyMatch = checkFuzzyNameMatch(s1, s2)
    if (fuzzyMatch !== null && fuzzyMatch !== undefined) return fuzzyMatch

    // Try pattern-based matching
    const patternMatch = checkPatternMatch(s1, s2)
    if (patternMatch !== null && patternMatch !== undefined) return patternMatch

    // Try substring matching
    const substringMatch = checkSubstringMatch(s1, s2)
    if (substringMatch !== null && substringMatch !== undefined) return substringMatch

    // No match found
    return buildNoMatchResult(s1, s2, countryCode)
  } catch (error) {
    logger.debug('Error in subdivision comparison: %o', error)
    return {
      isMatch: false,
      normalizedValue1: s1,
      normalizedValue2: s2,
      confidence: 0.0
    }
  }
}

/**
 * Check for direct string match
 */
function checkDirectMatch (s1: string, s2: string): { isMatch: boolean, normalizedValue1: string, normalizedValue2: string, confidence: number } | null {
  if (s1.toLowerCase() === s2.toLowerCase()) {
    return {
      isMatch: true,
      normalizedValue1: s1,
      normalizedValue2: s2,
      confidence: 1.0
    }
  }
  return null
}

/**
 * Compare ISO codes
 */
function compareISOCodes (s1: string, s2: string, countryCode: string): { isMatch: boolean, normalizedValue1: string, normalizedValue2: string, confidence: number } | null {
  const s1Code = normalizeToCode(s1, countryCode)
  const s2Code = normalizeToCode(s2, countryCode)

  if (s1Code?.length !== undefined && s2Code?.length !== undefined) {
    const match = s1Code === s2Code
    return {
      isMatch: match,
      normalizedValue1: s1Code,
      normalizedValue2: s2Code,
      confidence: match ? 0.95 : 0.1
    }
  }
  return null
}

/**
 * Normalize value to ISO code
 */
function normalizeToCode (value: string, countryCode: string): string | null {
  const matchResult = value.match(/^[A-Z]{2}-[A-Z0-9]{1,3}$/i)
  if (matchResult !== null && matchResult !== undefined) {
    return value.toUpperCase()
  }
  return nameToCode(value, countryCode)
}

/**
 * Check fuzzy name match
 */
function checkFuzzyNameMatch (s1: string, s2: string): { isMatch: boolean, normalizedValue1: string, normalizedValue2: string, confidence: number } | null {
  const s1Clean = cleanName(s1.toLowerCase())
  const s2Clean = cleanName(s2.toLowerCase())

  if (s1Clean === s2Clean) {
    return {
      isMatch: true,
      normalizedValue1: s1,
      normalizedValue2: s2,
      confidence: 0.8
    }
  }
  return null
}

/**
 * Check pattern-based match (city, county, province, region)
 */
function checkPatternMatch (s1: string, s2: string): { isMatch: boolean, normalizedValue1: string, normalizedValue2: string, confidence: number } | null {
  const cityPatterns = [
    { pattern: /city$/i, replacement: '' },
    { pattern: /county$/i, replacement: '' },
    { pattern: /province$/i, replacement: '' },
    { pattern: /region$/i, replacement: '' }
  ]

  let s1Special = s1.toLowerCase().trim()
  let s2Special = s2.toLowerCase().trim()

  for (const { pattern, replacement } of cityPatterns) {
    s1Special = s1Special.replace(pattern, replacement).trim()
    s2Special = s2Special.replace(pattern, replacement).trim()
  }

  if (s1Special === s2Special && s1Special.length > 2) {
    return {
      isMatch: true,
      normalizedValue1: s1,
      normalizedValue2: s2,
      confidence: 0.85
    }
  }
  return null
}

/**
 * Check substring match with confidence calculation
 */
function checkSubstringMatch (s1: string, s2: string): { isMatch: boolean, normalizedValue1: string, normalizedValue2: string, confidence: number } | null {
  const s1Clean = cleanName(s1.toLowerCase())
  const s2Clean = cleanName(s2.toLowerCase())

  if (s1Clean.includes(s2Clean) || s2Clean.includes(s1Clean)) {
    const confidence = calculateSubstringConfidence(s1Clean, s2Clean)

    if (confidence > 0.5) {
      return {
        isMatch: true,
        normalizedValue1: s1,
        normalizedValue2: s2,
        confidence
      }
    }
  }
  return null
}

/**
 * Calculate confidence for substring match
 */
function calculateSubstringConfidence (s1Clean: string, s2Clean: string): number {
  const minLen = Math.min(s1Clean.length, s2Clean.length)
  const maxLen = Math.max(s1Clean.length, s2Clean.length)
  let confidence = (minLen / maxLen) * 0.8

  // Bonus confidence if the shorter string is at the beginning
  const hasStartBonus = (s1Clean.length < s2Clean.length && s2Clean.startsWith(s1Clean)) ||
                          (s2Clean.length < s1Clean.length && s1Clean.startsWith(s2Clean))

  if (hasStartBonus) {
    confidence = Math.min(confidence + 0.2, 0.9)
  }

  return confidence
}

/**
 * Build result for no match
 */
function buildNoMatchResult (s1: string, s2: string, countryCode: string): { isMatch: boolean, normalizedValue1: string, normalizedValue2: string, confidence: number } {
  const s1Code = normalizeToCode(s1, countryCode)
  const s2Code = normalizeToCode(s2, countryCode)

  return {
    isMatch: false,
    normalizedValue1: s1Code ?? s1,
    normalizedValue2: s2Code ?? s2,
    confidence: 0.0
  }
}

/**
 * Get suggested subdivision matches for a given input
 * @param input - Input subdivision name or code
 * @param countryCode - Country code
 * @param limit - Maximum number of suggestions
 * @returns Array of suggested matches with confidence scores
 */
export function getSuggestions (
  input: string,
  countryCode: string,
  limit: number = 5
): Array<{ name: string, code: string, confidence: number }> {
  try {
    const subdivisions = getSubdivisions(countryCode)
    if (subdivisions === null || subdivisions === undefined) return []

    const inputClean = cleanName(input.toLowerCase())
    const suggestions = collectSuggestions(subdivisions, inputClean)

    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit)
  } catch (error) {
    logger.debug('Error getting suggestions: %o', error)
    return []
  }
}

/**
 * Collect suggestions from subdivisions
 */
function collectSuggestions (
  subdivisions: Record<string, SubdivisionInfo>,
  inputClean: string
): Array<{ name: string, code: string, confidence: number }> {
  const suggestions: Array<{ name: string, code: string, confidence: number }> = []

  for (const [subCode, subData] of Object.entries(subdivisions)) {
    const subdivision = subData
    if (subdivision.name === undefined || subdivision.name === null) continue

    const nameClean = cleanName(subdivision.name.toLowerCase())
    const confidence = calculateSuggestionConfidence(inputClean, nameClean)

    if (confidence > 0.3) {
      suggestions.push({
        name: subdivision.name,
        code: subCode,
        confidence
      })
    }
  }

  return suggestions
}

/**
 * Calculate confidence score for a suggestion
 */
function calculateSuggestionConfidence (inputClean: string, nameClean: string): number {
  if (nameClean === inputClean) {
    return 1.0
  }

  if (nameClean.includes(inputClean) || inputClean.includes(nameClean)) {
    const minLen = Math.min(inputClean.length, nameClean.length)
    const maxLen = Math.max(inputClean.length, nameClean.length)
    return (minLen / maxLen) * 0.8
  }

  return calculateLengthBasedConfidence(inputClean, nameClean)
}

/**
 * Calculate length-based confidence
 */
function calculateLengthBasedConfidence (inputClean: string, nameClean: string): number {
  const maxLen = Math.max(inputClean.length, nameClean.length)
  const minLen = Math.min(inputClean.length, nameClean.length)
  return maxLen > 0 ? (minLen / maxLen) * 0.5 : 0
}

/**
 * Clean subdivision name for comparison
 * @param name - Name to clean
 * @returns Cleaned name
 */
function cleanName (name: string): string {
  return name
    .toLowerCase()
    .replace(/[.\-\s_]/g, '')
    .replace(/\b(province|state|territory|region|prefecture|canton|department|of|the)\b/g, '')
    .replace(/\s+/g, '')
    .trim()
}

/**
 * Get all subdivisions for a country
 * @param countryCode - ISO country code
 * @returns Object with subdivision data
 */
export function getSubdivisionsForCountry (countryCode: string): Record<string, SubdivisionInfo> | null {
  try {
    // Get all subdivisions for the country using the correct data structure
    const countryData = (iso31662 as any).data[countryCode.toUpperCase()]
    const sub = countryData?.sub
    if (sub === null || sub === undefined) return null
    return sub as Record<string, SubdivisionInfo>
  } catch (error) {
    logger.debug('Error getting subdivisions for country %s: %o', countryCode, error)
    return null
  }
}

/**
 * Convert country name to ISO code
 * @param countryName - Full country name
 * @returns ISO country code or null
 */
export function countryNameToCode (countryName: string): string | null {
  try {
    return countries.getAlpha2Code(countryName, 'en') ?? null
  } catch (error) {
    return null
  }
}

/**
 * Convert ISO country code to name
 * @param countryCode - ISO country code
 * @returns Country name or null
 */
export function countryCodeToName (countryCode: string): string | null {
  try {
    return countries.getName(countryCode, 'en') ?? null
  } catch (error) {
    return null
  }
}

// Default export for compatibility
export default {
  nameToCode,
  codeToName,
  compareSubdivisions,
  getSuggestions,
  getSubdivisionsForCountry,
  countryNameToCode,
  countryCodeToName
}
