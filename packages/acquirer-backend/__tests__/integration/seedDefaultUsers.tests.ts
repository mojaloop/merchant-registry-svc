/* eslint-disable max-len */
import path from 'path'
import { DataSource } from 'typeorm'
import { DefaultDFSPUsers, DefaultHubUsers } from '../../src/database/defaultUsers'
import { seedDefaultRoles, seedDefaultUsers, seedDFSPs } from '../../src/database/initDatabase'
import { DFSPEntity } from '../../src/entity/DFSPEntity'
import { PortalRoleEntity } from '../../src/entity/PortalRoleEntity'
import { PortalUserEntity } from '../../src/entity/PortalUserEntity'

export function seedDefaultUsersTests (): void {
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

  it('should throw error when role is not found for hub user', async () => {
    // Arrange
    await seedDFSPs(AppDataSource)
    await seedDefaultRoles(AppDataSource)
    await AppDataSource.manager.delete(PortalRoleEntity, { name: DefaultHubUsers[0].role }) // Deleting role to ensure it does not exist

    // Act & Assert
    await expect(seedDefaultUsers(AppDataSource)).rejects.toThrowError(new Error(
      `Role '${DefaultHubUsers[0].role}' not found for seeding with '${DefaultHubUsers[0].email}'.`
    ))

    // Clean up
    await AppDataSource.manager.clear(PortalUserEntity)
    await AppDataSource.manager.clear(PortalRoleEntity)
    await AppDataSource.manager.clear(DFSPEntity)
  })

  it('should throw error when role is not found for DFSP User', async () => {
  // Arrange
    await AppDataSource.manager.clear(PortalRoleEntity) // Clearing roles to ensure none exists

    // Act & Assert
    await expect(seedDefaultUsers(AppDataSource)).rejects.toThrowError(new Error(
      `Role '${DefaultDFSPUsers[0].role}' not found for seeding with '${DefaultDFSPUsers[0].email}'.`
    ))

    // Clean up
    await AppDataSource.manager.clear(PortalUserEntity)
  })

  it('should throw error when DFSP is not found', async () => {
  // Arrange
    await AppDataSource.manager.clear(DFSPEntity) // Clearing DFSPEntity to ensure none exists
    await seedDefaultRoles(AppDataSource)

    // Act & Assert
    await expect(seedDefaultUsers(AppDataSource)).rejects.toThrowError(
      new Error(`DFSP '${DefaultDFSPUsers[0].dfsp_name}' not found for seeding with '${DefaultDFSPUsers[0].email}'.`)
    )

    // Clean up
    await AppDataSource.manager.clear(PortalUserEntity)
    await AppDataSource.manager.clear(PortalRoleEntity)
  })

  it('should seed default users', async () => {
    // Arrange
    await AppDataSource.manager.clear(PortalUserEntity)
    await seedDefaultRoles(AppDataSource)
    await seedDFSPs(AppDataSource)

    // Act
    await seedDefaultUsers(AppDataSource)

    // Assert
    const usersCountInDB = await AppDataSource.manager.count(PortalUserEntity)
    expect(usersCountInDB).toBe(DefaultHubUsers.length + DefaultDFSPUsers.length)

    // Clean up
    await AppDataSource.manager.clear(PortalUserEntity)
    await AppDataSource.manager.clear(PortalRoleEntity)
    await AppDataSource.manager.clear(DFSPEntity)
  })

  it('should not duplicate data when seeded multiple times', async () => {
    // Arrange
    await AppDataSource.manager.clear(PortalUserEntity)
    await seedDefaultRoles(AppDataSource)
    await seedDFSPs(AppDataSource)

    await seedDefaultUsers(AppDataSource)
    await seedDefaultUsers(AppDataSource)

    const usersCountInDB = await AppDataSource.manager.count(PortalUserEntity)
    expect(usersCountInDB).toBe(DefaultHubUsers.length + DefaultDFSPUsers.length)

    // Clean up
    await AppDataSource.manager.clear(PortalUserEntity)
    await AppDataSource.manager.clear(PortalRoleEntity)
    await AppDataSource.manager.clear(DFSPEntity)
  })
}
