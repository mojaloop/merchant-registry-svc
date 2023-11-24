import request from 'supertest'
import { type Application } from 'express'
import { registerEndpointDFSP } from '../../src/services/registerEndpointDFSP'
import { AppDataSource } from '../../src/database/dataSource'
import { RegistryEntity } from '../../src/entity/RegistryEntity'

export function POSTParticipantsTests (app: Application): void {
  const dfspData = {
    fspId: 'testFspId',
    dfsp_name: 'Test DFSP',
    client_secret: 'random-secret-key'
  }

  beforeAll(async () => {
    await registerEndpointDFSP(dfspData)
  })

  beforeEach(async () => {
    await AppDataSource.query('PRAGMA foreign_keys = OFF;')
    await AppDataSource.manager.delete(RegistryEntity, {})
    await AppDataSource.query('PRAGMA foreign_keys = ON;')
  })

  it('should return 400 when missing x-api-key header', async () => {
    // Arrange
    const participants = [
      {
        merchant_id: '610001',
        currency: 'USD',
        alias_value: '610001'
      }
    ]

    // Act
    const res = await request(app)
      .post('/participants')
      .send(participants)
    // Assert
    expect(res.status).toBe(400)
    expect(res.body).toBeInstanceOf(Object)
    expect(res.body).toHaveProperty('errorInformation')
    expect(res.body.errorInformation.errorCode).toBe('3002')
    expect(res.body.errorInformation.errorDescription).toBe('Missing header: x-api-key')
  })

  it('should return 200 with array of participants', async () => {
    // Arrange
    const participants = [
      {
        merchant_id: '600001',
        currency: 'USD',
        alias_value: '600001'
      },
      {
        merchant_id: '600002',
        currency: 'EUR',
        alias_value: '600002'
      },
      {
        merchant_id: '600003',
        currency: 'JPY'
        // alias_value will be generated
      }
    ]

    // Act
    const res = await request(app)
      .post('/participants')
      .set('x-api-key', dfspData.client_secret)
      .send(participants)

    // Assert
    expect(res.status).toBe(200)
    expect(res.body).toBeInstanceOf(Array)
    expect(res.body.length).toBe(3)

    const participant = res.body[0]
    expect(participant).toHaveProperty('merchant_id')
    expect(participant).toHaveProperty('alias_value')

    expect(participant.merchant_id).toBe(participants[0].merchant_id)
    expect(participant.alias_value).toBe(participants[0].alias_value)

    expect(res.body[1].merchant_id).toBe(participants[1].merchant_id)
    expect(res.body[1].alias_value).toBe(participants[1].alias_value)

    expect(res.body[2].merchant_id).toBe(participants[2].merchant_id)
    expect(res.body[2].alias_value.length).toBeGreaterThan(0) // alias_value will be generated
  })
}
