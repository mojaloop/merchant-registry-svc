import {
  Entity,
  PrimaryGeneratedColumn, Column,
  OneToMany, ManyToMany,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm'

import { DFSPType } from 'shared-lib'
import { PortalUserEntity } from './PortalUserEntity'
import { DFSPMerchantRelationsEntity } from './DFSPMerchantRelationsEntity'

@Entity('dfsps')
export class DFSPEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false, length: 255 })
    name!: string

  @Column({ type: 'enum', enum: DFSPType, nullable: false, default: DFSPType.BANK })
    dfsp_type!: DFSPType

  @Column({ type: 'datetime', nullable: false })
    joined_date!: Date

  @Column({ type: 'boolean', nullable: false, default: false })
    activated!: boolean

  @Column({ nullable: false, length: 512 })
    logo_uri!: string

  @ManyToMany(() => PortalUserEntity, user => user.dfsps)
    portal_users!: PortalUserEntity[]

  @OneToMany(() => DFSPMerchantRelationsEntity, relation => relation.dfsp)
    dfsp_merchant_relations!: DFSPMerchantRelationsEntity[]

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
