import path from 'path'
import { DataSource } from 'typeorm'
import { DefaultDFSPs } from '../../src/database/defaultDfsps'
import { seedDFSPs } from '../../src/database/initDatabase'
import { DFSPEntity } from '../../src/entity/DFSPEntity'

export function seedDFSPsTests (): void {
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

  it('should seed default DFSPs', async () => {
    // Arrange
    await AppDataSource.manager.clear(DFSPEntity)

    // Act
    await seedDFSPs(AppDataSource)

    // Assert
    const dfspCountInDB = await AppDataSource.manager.count(DFSPEntity)
    expect(dfspCountInDB).toBe(DefaultDFSPs.length)

    // Clean up
    await AppDataSource.manager.clear(DFSPEntity)
  })

  it('should not duplicate data when seeded multiple times', async () => {
    // Arrange
    await AppDataSource.manager.clear(DFSPEntity)

    await seedDFSPs(AppDataSource)
    await seedDFSPs(AppDataSource)

    const dfspCountInDB = await AppDataSource.manager.count(DFSPEntity)
    expect(dfspCountInDB).toBe(DefaultDFSPs.length)

    // Clean up
    await AppDataSource.manager.clear(DFSPEntity)
  })
}
