import path from 'path'
import { DataSource } from 'typeorm'
import { seedDefaultPermissions } from '../../src/database/initDatabase'
import { PortalPermissionEntity } from '../../src/entity/PortalPermissionEntity'
import { PermissionsEnum } from '../../src/types/permissions'

export function seedDefaultPermissionsTests (): void {
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

  it('should seed default permissions', async () => {
    // Arrange
    await AppDataSource.manager.clear(PortalPermissionEntity)

    // Act
    await seedDefaultPermissions(AppDataSource)

    // Assert
    const permissionsCountInDB = await AppDataSource.manager.count(PortalPermissionEntity)
    expect(permissionsCountInDB).toBe(Object.keys(PermissionsEnum).length)

    // Clean up
    await AppDataSource.manager.clear(PortalPermissionEntity)
  })

  it('should not duplicate data when seeded multiple times', async () => {
    // Arrange
    await AppDataSource.manager.clear(PortalPermissionEntity)

    await seedDefaultPermissions(AppDataSource)
    await seedDefaultPermissions(AppDataSource)

    const permissionsCountInDB = await AppDataSource.manager.count(PortalPermissionEntity)
    expect(permissionsCountInDB).toBe(Object.keys(PermissionsEnum).length)

    // Clean up
    await AppDataSource.manager.clear(PortalPermissionEntity)
  })
}
