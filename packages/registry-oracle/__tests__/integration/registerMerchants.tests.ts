import { type RegistryEntity } from '../../src/entity/RegistryEntity'
import { type MerchantData, registerMerchants } from '../../src/services/registerMerchant'

export function testRegisterMerchants (): void {
  test('Registering a list of valid merchants', async () => {
    // Prepare your merchant data
    const merchants: MerchantData[] = [{
      merchant_id: 66001,
      fspId: 'fsp1',
      dfsp_name: 'DFSP #1',
      checkout_counter_id: 66101,
      currency_code: {
        iso_code: 'USD',
        description: 'US Dollar'
      }
    }, {
      merchant_id: 66002,
      fspId: 'fsp2',
      dfsp_name: 'DFSP #2',
      checkout_counter_id: 66102,
      currency_code: {
        iso_code: 'EUR',
        description: 'Euro'
      }
    }]

    // Call your function
    const result: RegistryEntity[] = await registerMerchants(merchants)

    // Assertions
    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(merchants.length)
    expect(result[0].alias_value).toBeDefined()
    expect(result[0].alias_value.length).toBeGreaterThan(0)

    expect(result[1].alias_value).toBeDefined()
    expect(result[1].alias_value.length).toBeGreaterThan(0)

    expect(result[0].alias_value).not.toEqual(result[1].alias_value)
  })

  test('Handling empty merchant list', async () => {
    const result = await registerMerchants([])
    expect(result).toEqual([])
  })
}
