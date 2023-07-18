import {
  Entity,
  Column, PrimaryGeneratedColumn, ManyToOne,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm'
import { DFSPEntity } from './DFSPEntity'
import { MerchantEntity } from './MerchantEntity'

@Entity('DFSPMerchantRelations')
export class DFSPMerchantRelationsEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ type: 'boolean', nullable: false, default: false })
    is_default!: boolean

  @ManyToOne(() => DFSPEntity, dfsp => dfsp.dfsp_merchant_relations)
    dfsp!: DFSPEntity

  @ManyToOne(() => MerchantEntity, merchant => merchant.dfsp_merchant_relations)
    merchant!: MerchantEntity

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
