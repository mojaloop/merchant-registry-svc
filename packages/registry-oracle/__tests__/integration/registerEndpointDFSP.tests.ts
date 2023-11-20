import { APIAccessEntity } from '../../src/entity/APIAccessEntity'
import { registerEndpointDFSP } from '../../src/services/registerEndpointDFSP'

export function testRegisterDFSPEndpoint (): void {
  test('Successful DFSP registration', async () => {
    const dfspData = {
      fspId: 'testFspId',
      dfsp_name: 'Test DFSP',
      client_secret: 'random-secret-key'
    }

    const result = await registerEndpointDFSP(dfspData)

    expect(result).toBeInstanceOf(APIAccessEntity)
    expect(result.client_secret).toBe(dfspData.client_secret)
  })
}
