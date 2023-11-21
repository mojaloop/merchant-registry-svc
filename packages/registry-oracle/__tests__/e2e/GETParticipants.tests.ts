import request from 'supertest'
import { type Application } from 'express'
import { type MerchantData, registerMerchants } from '../../src/services/registerMerchant'
import { type RegistryEntity } from '../../src/entity/RegistryEntity'

export function GETParticipantsTests (app: Application): void {
  let registryEntries: RegistryEntity[] = []
  beforeAll(async () => {
    const merchants: MerchantData[] = [
      {
        merchant_id: 1,
        fspId: 'fsp1',
        dfsp_name: 'DFSP #1',
        checkout_counter_id: 1,
        currency_code: {
          iso_code: 'USD',
          description: 'US Dollar'
        }
      }
    ]
    registryEntries = await registerMerchants(merchants)
  })

  it('should return 200 with {"partyList": []}', async () => {
    // Arrange
    // Act
    const res = await request(app)
      .get('/participants/ALIAS/9999999')

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('partyList')
    expect(res.body.partyList).toHaveLength(0)
  })

  it('should return 200 with {"partyList": [{"currency": "USD", "fspId": "fsp1"}]}', async () => {
    // Arrange
    // Act
    const res = await request(app)
      .get(`/participants/ALIAS/${registryEntries[0].alias_value}`)

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('partyList')
    expect(res.body.partyList).toHaveLength(1)
    expect(res.body.partyList[0]).toHaveProperty('fspId', registryEntries[0].fspId)
    expect(res.body.partyList[0]).toHaveProperty('currency', registryEntries[0].currency)
  })
}
