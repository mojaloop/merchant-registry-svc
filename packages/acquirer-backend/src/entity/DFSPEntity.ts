import {
  Entity,
  PrimaryGeneratedColumn, Column,
  OneToMany,
  CreateDateColumn, UpdateDateColumn, ManyToMany
} from 'typeorm'

import { DFSPType } from 'shared-lib'
import { PortalUserEntity } from './PortalUserEntity'
import { MerchantEntity } from './MerchantEntity'

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

  @OneToMany(() => PortalUserEntity, user => user.dfsp)
    portal_users!: PortalUserEntity[]

  @ManyToMany(() => MerchantEntity, merchant => merchant.dfsps)
    merchants!: MerchantEntity[]

  @OneToMany(() => MerchantEntity, merchant => merchant.default_dfsp)
    defaulted_merchants!: MerchantEntity[]

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
