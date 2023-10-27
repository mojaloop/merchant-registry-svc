import { MerchantCategoryCodes } from 'shared-lib'
import { MerchantCategoryEntity } from '../../src/entity/MerchantCategoryEntity'
import { seedCategoryCode } from '../../src/database/initDatabase'
import { DataSource } from 'typeorm'
import path from 'path'

export function seedCategoryCodeTests (): void {
  let AppDataSource: DataSource
  let merchantCategoryCodes: Record<string, string>
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

    // Only seed the first 8 categories
    merchantCategoryCodes = Object.fromEntries(Object.entries(MerchantCategoryCodes).slice(0, 8))
  })

  it('should seed merchant category codes', async () => {
    // Arrange
    await AppDataSource.manager.clear(MerchantCategoryEntity)

    // Act
    await seedCategoryCode(AppDataSource, merchantCategoryCodes)

    // Assert
    const categoriesCountInDB = await AppDataSource.manager.count(MerchantCategoryEntity)
    expect(categoriesCountInDB).toBe(Object.keys(merchantCategoryCodes).length)

    // Clean up
    await AppDataSource.manager.clear(MerchantCategoryEntity)
  }, 20000) // Increase timeout to 20 seconds for seeding to complete

  it('should not duplicate data when seeded multiple times', async () => {
    // Arrange
    await AppDataSource.manager.clear(MerchantCategoryEntity)

    await seedCategoryCode(AppDataSource, merchantCategoryCodes)
    await seedCategoryCode(AppDataSource, merchantCategoryCodes)

    const categoriesCountInDB = await AppDataSource.manager.count(MerchantCategoryEntity)
    expect(categoriesCountInDB).toBe(Object.keys(merchantCategoryCodes).length)

    // Clean up
    await AppDataSource.manager.clear(MerchantCategoryEntity)
  }, 20000) // Increase timeout to 20 seconds for seeding to complete
}
