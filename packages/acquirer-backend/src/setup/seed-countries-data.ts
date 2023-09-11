import fs from 'fs'
import path from 'path'
import { CountryEntity } from '../entity/CountryEntity'
import { CountrySubdivisionEntity } from '../entity/CountrySubdivisionEntity'
import { DistrictEntity } from '../entity/DistrictEntity'
import { AppDataSource } from '../database/data-source'
import logger from '../services/logger'

interface SubdivisionData {
  name: string
  districts: string[]
}

interface CountryData {
  name: string
  country_subdivisions: SubdivisionData[]
}

export async function seedCountriesSubdivisionsDistricts (): Promise<void> {
  logger.info('Seeding Country.. please wait.. for long process..')

  const filePath = path.join(__dirname, 'countries.json')
  const rawData = fs.readFileSync(filePath, 'utf-8')
  const seedData: CountryData[] = JSON.parse(rawData)

  await AppDataSource.manager.clear(DistrictEntity)
  for (const countryData of seedData) {
    let country = await AppDataSource.manager.findOne(
      CountryEntity, { where: { name: countryData.name } }
    )

    if (country == null) {
      country = new CountryEntity()
      country.name = countryData.name
      await AppDataSource.manager.save(country)
    }

    for (const subdivisionData of countryData.country_subdivisions) {
      let subdivision = await AppDataSource.manager.findOne(
        CountrySubdivisionEntity, { where: { name: subdivisionData.name } }
      )

      if (subdivision == null) {
        subdivision = new CountrySubdivisionEntity()
        subdivision.name = subdivisionData.name
        subdivision.country = country
        await AppDataSource.manager.save(subdivision)
      }

      for (const districtName of subdivisionData.districts) {
          const district = new DistrictEntity()
          district.name = districtName
          district.subdivision = subdivision
          await AppDataSource.manager.save(district)
        }
      }
    }
  }

  logger.info('Seeding Countries, Subdivisions and Districts... Done')
}
