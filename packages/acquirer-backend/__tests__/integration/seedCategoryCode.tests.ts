import { MerchantCategoryCodes } from 'shared-lib'
import { MerchantCategoryEntity } from '../../src/entity/MerchantCategoryEntity'
import { seedCategoryCode } from '../../src/database/initDatabase'
import { DataSource } from 'typeorm'
import path from 'path'

export function seedCategoryCodeTests (): void {
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

  it('should seed merchant category codes', async () => {
    // Arrange
    await AppDataSource.manager.clear(MerchantCategoryEntity)

    // Act
    await seedCategoryCode(AppDataSource)

    // Assert
    const categoriesCountInDB = await AppDataSource.manager.count(MerchantCategoryEntity)
    expect(categoriesCountInDB).toBe(Object.keys(MerchantCategoryCodes).length)

    // Clean up
    await AppDataSource.manager.clear(MerchantCategoryEntity)
  })

  it('should not duplicate data when seeded multiple times', async () => {
    // Arrange
    await AppDataSource.manager.clear(MerchantCategoryEntity)

    await seedCategoryCode(AppDataSource)
    await seedCategoryCode(AppDataSource)

    const categoriesCountInDB = await AppDataSource.manager.count(MerchantCategoryEntity)
    expect(categoriesCountInDB).toBe(Object.keys(MerchantCategoryCodes).length)

    // Clean up
    await AppDataSource.manager.clear(MerchantCategoryEntity)
  })
}
