import fs from 'fs'
import path from 'path'
import { DataSource } from 'typeorm'
import {
  type CountryData,
  seedCountriesSubdivisionsDistricts
} from '../../src/database/initDatabase'
import { CountryEntity } from '../../src/entity/CountryEntity'
import { CountrySubdivisionEntity } from '../../src/entity/CountrySubdivisionEntity'
import { DistrictEntity } from '../../src/entity/DistrictEntity'

export function seedCountriesSubdivisionsDistrictsTests (): void {
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

  it('should seed default countries', async () => {
    // Arrange
    await AppDataSource.manager.clear(DistrictEntity)
    await AppDataSource.manager.clear(CountrySubdivisionEntity)
    await AppDataSource.manager.clear(CountryEntity)

    const countryDataPath = path.join(__dirname, '../test-files/sample.countries.json')
    const rawData = fs.readFileSync(countryDataPath, 'utf-8')
    const countryData: CountryData[] = JSON.parse(rawData)

    // Act
    await seedCountriesSubdivisionsDistricts(AppDataSource, countryDataPath)

    // Assert
    const countriesCountInDB = await AppDataSource.manager.count(CountryEntity)
    expect(countriesCountInDB).toBe(countryData.length)

    // Clean up
    await AppDataSource.manager.clear(DistrictEntity)
    await AppDataSource.manager.clear(CountrySubdivisionEntity)
    await AppDataSource.manager.clear(CountryEntity)
  })
}
