import {
  Entity,
  Column, PrimaryGeneratedColumn, ManyToMany,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm'
import { PortalRoleEntity } from './PortalRoleEntity'

export enum APIRouteMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

@Entity('portal_permissions')
export class PortalPermissionEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false, length: 255 })
    name!: string

  @Column({ nullable: false, length: 255, default: '' })
    description!: string

  @ManyToMany(() => PortalRoleEntity, role => role.permissions)
    roles!: PortalRoleEntity[]

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
