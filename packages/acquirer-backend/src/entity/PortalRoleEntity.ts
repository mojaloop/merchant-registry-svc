import {
  Entity,
  Column, PrimaryGeneratedColumn, OneToMany, ManyToMany,
  CreateDateColumn, UpdateDateColumn, JoinTable
} from 'typeorm'
import { PortalPermissionEntity } from './PortalPermissionEntity'
import { PortalUserEntity } from './PortalUserEntity'

@Entity('portal_roles')
export class PortalRoleEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false, length: 255 })
    role_name!: string

  @Column({ nullable: false, length: 255 })
    description!: string

  @ManyToMany(() => PortalPermissionEntity, permission => permission.roles)
  @JoinTable()
    permissions!: PortalPermissionEntity[]

  @OneToMany(() => PortalUserEntity, user => user.role)
    users!: PortalUserEntity[]

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
