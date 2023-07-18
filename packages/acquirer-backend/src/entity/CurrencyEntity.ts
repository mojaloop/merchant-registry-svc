import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm'
import { MerchantEntity } from './MerchantEntity'

@Entity('currencies')
export class CurrencyEntity {
  @PrimaryColumn({ length: 3 })
    iso_code!: string

  @Column({ nullable: false, length: 255 })
    description!: string

  @OneToMany(() => MerchantEntity, merchant => merchant.currency_code)
    merchants!: MerchantEntity[]
}
