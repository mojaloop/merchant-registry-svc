import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm'
import { MerchantEntity } from './MerchantEntity'

@Entity('merchant_categories')
export class MerchantCategoryEntity {
  @PrimaryColumn({ length: 10 }) // length should be just 6
    category_code!: string

  @Column({ nullable: false, length: 255 })
    description!: string

  @OneToMany(() => MerchantEntity, merchant => merchant.category_code)
    merchants!: MerchantEntity[]
}
