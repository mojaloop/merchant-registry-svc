import {
  Entity,
  Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, OneToMany
} from 'typeorm'
import { EndpointDFSPEntity } from './EndpointDFSPEntity'

@Entity('api_access')
export class APIAccessEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false })
    client_secret!: string

  @OneToMany(
    () => EndpointDFSPEntity,
    endpointDFSP => endpointDFSP.api_access
  )
    endpoints!: EndpointDFSPEntity[]

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
