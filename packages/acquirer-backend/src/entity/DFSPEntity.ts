import {
  Entity,
  PrimaryGeneratedColumn, Column,
  OneToMany,
  CreateDateColumn, UpdateDateColumn, ManyToMany
} from 'typeorm'

import { DFSPType } from 'shared-lib'
import { PortalUserEntity } from './PortalUserEntity'
import { MerchantEntity } from './MerchantEntity'
import { AuditEntity } from './AuditEntity'

@Entity('dfsps')
export class DFSPEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false, length: 255 })
    name!: string

  @Column({ nullable: false, length: 255 })
    fspId!: string

  @Column({ type: 'simple-enum', enum: DFSPType, nullable: false, default: DFSPType.BANK })
    dfsp_type!: DFSPType

  @Column({ type: 'boolean', nullable: false, default: true })
    activated!: boolean

  @Column({ nullable: true, length: 512 })
    logo_uri!: string

  @Column({ nullable: true, length: 512 })
    business_license_id!: string

  @Column({ nullable: true })
    client_secret!: string

  @OneToMany(() => PortalUserEntity, user => user.dfsp)
    portal_users!: PortalUserEntity[]

  @ManyToMany(() => MerchantEntity, merchant => merchant.dfsps)
    merchants!: MerchantEntity[]

  @OneToMany(() => MerchantEntity, merchant => merchant.default_dfsp)
    defaulted_merchants!: MerchantEntity[]

  @OneToMany(() => AuditEntity, audit => audit.dfsp)
    audits!: AuditEntity[]

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
