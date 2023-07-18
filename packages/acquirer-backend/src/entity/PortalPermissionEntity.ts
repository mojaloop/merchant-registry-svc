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
    permission_name!: string

  @Column({ nullable: false, length: 255 })
    description!: string

  @Column({ nullable: false, length: 255 })
    api_route_path!: string

  @Column({ type: 'enum', enum: APIRouteMethod, nullable: false, default: APIRouteMethod.GET })
    api_route_method!: APIRouteMethod

  @Column({ type: 'boolean', default: false })
    is_allowed!: boolean

  @ManyToMany(() => PortalRoleEntity, role => role.permissions)
    roles!: PortalRoleEntity[]

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
