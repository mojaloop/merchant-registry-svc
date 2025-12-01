/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-extraneous-class */
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

export class SubdivisionMappingService {
  /**
   * Converts a human-readable subdivision name to ISO 3166-2 format
   * @param subdivisionName - Human readable name (e.g., "Ontario")
   * @param countryCode - ISO country code (e.g., "CA")
   * @returns ISO 3166-2 code (e.g., "CA-ON") or null
   */
  static nameToCode (subdivisionName: string, countryCode: string): string | null {
    if (!subdivisionName || !countryCode) return null

    try {
      // Get all subdivisions for the country using the correct data structure
      const countryData = (iso31662 as any).data[countryCode.toUpperCase()]
      if (!countryData?.sub) return null

      const subdivisions = countryData.sub
      const nameToFind = subdivisionName.trim().toLowerCase()

      // Search through all subdivisions
      for (const [subCode, subData] of Object.entries(subdivisions)) {
        const subdivision = subData as SubdivisionInfo
        if (subdivision.name && subdivision.name.toLowerCase() === nameToFind) {
          return subCode // This is already in format CA-ON
        }
      }

      // Try fuzzy matching for common variations
      for (const [subCode, subData] of Object.entries(subdivisions)) {
        const subdivision = subData as SubdivisionInfo
        if (subdivision.name) {
          const subName = subdivision.name.toLowerCase()

          // Check if names match after removing common words
          const cleanSubName = this.cleanName(subName)
          const cleanSearchName = this.cleanName(nameToFind)

          if (cleanSubName === cleanSearchName) {
            return subCode
          }

          // Check partial matches for longer names
          if (subName.includes(nameToFind) || nameToFind.includes(subName)) {
            if (Math.abs(subName.length - nameToFind.length) <= 3) {
              return subCode
            }
          }
        }
      }

      return null
    } catch (error) {
      logger.debug('Error converting subdivision name to code: %o', error)
      return null
    }
  }

  /**
   * Converts an ISO 3166-2 code to human-readable name
   * @param subdivisionCode - ISO code (e.g., "CA-ON")
   * @returns Human readable name (e.g., "Ontario") or null
   */
  static codeToName (subdivisionCode: string): string | null {
    if (!subdivisionCode) return null

    try {
      const parts = subdivisionCode.split('-')
      if (parts.length !== 2) return null

      const [countryCode, subCode] = parts
      const subdivision = iso31662.subdivision(countryCode, subCode)

      return subdivision?.name || null
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
  static compareSubdivisions (
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
    if (s1.toLowerCase() === s2.toLowerCase()) {
      return {
        isMatch: true,
        normalizedValue1: s1,
        normalizedValue2: s2,
        confidence: 1.0
      }
    }

    try {
      // Try to normalize both values to ISO codes
      let s1Code: string | null = null
      let s2Code: string | null = null

      // Check if s1 is already a code
      if (s1.match(/^[A-Z]{2}-[A-Z0-9]{1,3}$/i)) {
        s1Code = s1.toUpperCase()
      } else {
        // Try to find s1 as a name
        s1Code = this.nameToCode(s1, countryCode)
      }

      // Check if s2 is already a code
      if (s2.match(/^[A-Z]{2}-[A-Z0-9]{1,3}$/i)) {
        s2Code = s2.toUpperCase()
      } else {
        // Try to find s2 as a name
        s2Code = this.nameToCode(s2, countryCode)
      }

      // If we got codes for both, compare them
      if (s1Code && s2Code) {
        const match = s1Code === s2Code
        return {
          isMatch: match,
          normalizedValue1: s1Code,
          normalizedValue2: s2Code,
          confidence: match ? 0.95 : 0.1
        }
      }

      // Try fuzzy matching on names
      const s1Clean = this.cleanName(s1.toLowerCase())
      const s2Clean = this.cleanName(s2.toLowerCase())

      if (s1Clean === s2Clean) {
        return {
          isMatch: true,
          normalizedValue1: s1,
          normalizedValue2: s2,
          confidence: 0.8
        }
      }

      // Special pattern matching for common city/subdivision variations
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

      // Substring matching with improved confidence calculation
      if (s1Clean.includes(s2Clean) || s2Clean.includes(s1Clean)) {
        const minLen = Math.min(s1Clean.length, s2Clean.length)
        const maxLen = Math.max(s1Clean.length, s2Clean.length)

        // Higher confidence for cases where shorter name is contained in longer
        // This handles cases like "Nairobi" vs "Nairobi City"
        let confidence = (minLen / maxLen) * 0.8

        // Bonus confidence if the shorter string is at the beginning of the longer one
        if ((s1Clean.length < s2Clean.length && s2Clean.startsWith(s1Clean)) ||
            (s2Clean.length < s1Clean.length && s1Clean.startsWith(s2Clean))) {
          confidence = Math.min(confidence + 0.2, 0.9)
        }

        if (confidence > 0.5) {
          return {
            isMatch: true,
            normalizedValue1: s1,
            normalizedValue2: s2,
            confidence
          }
        }
      }

      return {
        isMatch: false,
        normalizedValue1: s1Code || s1,
        normalizedValue2: s2Code || s2,
        confidence: 0.0
      }
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
   * Get suggested subdivision matches for a given input
   * @param input - Input subdivision name or code
   * @param countryCode - Country code
   * @param limit - Maximum number of suggestions
   * @returns Array of suggested matches with confidence scores
   */
  static getSuggestions (
    input: string,
    countryCode: string,
    limit: number = 5
  ): Array<{ name: string, code: string, confidence: number }> {
    try {
      // Get all subdivisions for the country using the correct data structure
      const countryData = (iso31662 as any).data[countryCode.toUpperCase()]
      if (!countryData?.sub) return []

      const subdivisions = countryData.sub
      const inputClean = this.cleanName(input.toLowerCase())
      const suggestions: Array<{ name: string, code: string, confidence: number }> = []

      for (const [subCode, subData] of Object.entries(subdivisions)) {
        const subdivision = subData as SubdivisionInfo
        if (!subdivision.name) continue

        const nameClean = this.cleanName(subdivision.name.toLowerCase())
        let confidence = 0

        if (nameClean === inputClean) {
          confidence = 1.0
        } else if (nameClean.includes(inputClean) || inputClean.includes(nameClean)) {
          confidence = Math.min(inputClean.length, nameClean.length) / Math.max(inputClean.length, nameClean.length) * 0.8
        } else {
          // Simple similarity score
          const maxLen = Math.max(inputClean.length, nameClean.length)
          const minLen = Math.min(inputClean.length, nameClean.length)
          if (maxLen > 0) {
            confidence = (minLen / maxLen) * 0.5
          }
        }

        if (confidence > 0.3) {
          suggestions.push({
            name: subdivision.name,
            code: subCode, // Use subCode directly (already in CA-ON format)
            confidence
          })
        }
      }

      return suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit)
    } catch (error) {
      logger.debug('Error getting suggestions: %o', error)
      return []
    }
  }

  /**
   * Clean subdivision name for comparison
   * @param name - Name to clean
   * @returns Cleaned name
   */
  private static cleanName (name: string): string {
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
  static getSubdivisionsForCountry (countryCode: string): Record<string, SubdivisionInfo> | null {
    try {
      // Get all subdivisions for the country using the correct data structure
      const countryData = (iso31662 as any).data[countryCode.toUpperCase()]
      if (!countryData?.sub) return null
      return countryData.sub as Record<string, SubdivisionInfo>
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
  static countryNameToCode (countryName: string): string | null {
    try {
      return countries.getAlpha2Code(countryName, 'en') || null
    } catch (error) {
      return null
    }
  }

  /**
   * Convert ISO country code to name
   * @param countryCode - ISO country code
   * @returns Country name or null
   */
  static countryCodeToName (countryCode: string): string | null {
    try {
      return countries.getName(countryCode, 'en') || null
    } catch (error) {
      return null
    }
  }
}

export default SubdivisionMappingService
