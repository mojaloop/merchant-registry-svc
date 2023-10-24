import path from 'path'
import { CurrencyCodes } from 'shared-lib'
import { DataSource } from 'typeorm'
import { seedCurrency } from '../../src/database/initDatabase'
import { CurrencyEntity } from '../../src/entity/CurrencyEntity'

export function seedCurrencyTests (): void {
  let AppDataSource: DataSource
  beforeAll(async () => {
    AppDataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: [
        path.join(__dirname, '../../src/entity/*.ts')
      ],
      migrations: [],
      subscribers: []
    })
    await AppDataSource.initialize()
  })
  it('should seed currency codes', async () => {
    // Arrange
    await AppDataSource.manager.clear(CurrencyEntity)

    // Act
    await seedCurrency(AppDataSource)

    // Assert
    const currenciesCountInDB = await AppDataSource.manager.count(CurrencyEntity)
    expect(currenciesCountInDB).toBe(Object.keys(CurrencyCodes).length)

    // Clean up
    await AppDataSource.manager.clear(CurrencyEntity)
  }, 20000)

  it('should not duplicate data when seeded multiple times', async () => {
    // Arrange
    await AppDataSource.manager.clear(CurrencyEntity)

    await seedCurrency(AppDataSource)
    await seedCurrency(AppDataSource)

    const currencyCountInDB = await AppDataSource.manager.count(CurrencyEntity)
    expect(currencyCountInDB).toBe(Object.keys(CurrencyCodes).length)

    // Clean up
    await AppDataSource.manager.clear(CurrencyEntity)
  }, 20000)
}
