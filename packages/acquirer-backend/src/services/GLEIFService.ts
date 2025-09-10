/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import axios, { isAxiosError } from 'axios'
import logger from './logger'

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
          country: string
        }
        headquartersAddress: {
          country: string
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

export class GLEIFService {
  private readonly baseUrl: string
  private readonly apiKey?: string

  constructor () {
    this.baseUrl = process.env.GLEIF_API_URL ?? 'https://api.gleif.org/api/v1'
    this.apiKey = process.env.GLEIF_API_KEY
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
        
        //console.log(legalName)
        // 🔍 Check if provided name matches the legal name from GLEIF
        if (name.trim().toLowerCase() !== legalName.trim().toLowerCase()) {
          return {
            isValid: false,
            error: `Provided entity name "${name}" does not match registered legal name "${legalName}" from GLEIF`
          }
        }

        return {
          isValid: true,
          entityName: legalName,
          country: attributes.entity.legalAddress.country || attributes.entity.headquartersAddress.country,
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
   * Checks if the GLEIF service is properly configured
   * @returns boolean
   */
  isConfigured (): boolean {
    return !!this.baseUrl
  }
}

export const gleifService = new GLEIFService()
