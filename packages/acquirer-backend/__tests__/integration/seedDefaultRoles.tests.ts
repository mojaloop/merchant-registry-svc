import path from 'path'
import { DataSource } from 'typeorm'
import { DefaultRoles } from '../../src/database/defaultRoles'
import { seedDefaultRoles } from '../../src/database/initDatabase'
import { PortalRoleEntity } from '../../src/entity/PortalRoleEntity'

export function seedDefaultRolesTests (): void {
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

  it('should seed default roles', async () => {
    // Arrange
    await AppDataSource.manager.clear(PortalRoleEntity)

    // Act
    await seedDefaultRoles(AppDataSource)

    // Assert
    const rolesCountInDB = await AppDataSource.manager.count(PortalRoleEntity)
    expect(rolesCountInDB).toBe(DefaultRoles.length)

    // Clean up
    await AppDataSource.manager.clear(PortalRoleEntity)
  })

  it('should not duplicate data when seeded multiple times', async () => {
    // Arrange
    await AppDataSource.manager.clear(PortalRoleEntity)

    await seedDefaultRoles(AppDataSource)
    await seedDefaultRoles(AppDataSource)

    const rolesCountInDB = await AppDataSource.manager.count(PortalRoleEntity)
    expect(rolesCountInDB).toBe(DefaultRoles.length)

    // Clean up
    await AppDataSource.manager.clear(PortalRoleEntity)
  })
}
