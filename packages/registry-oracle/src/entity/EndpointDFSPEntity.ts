import {
  Entity,
  Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, ManyToOne
} from 'typeorm'
import { APIAccessEntity } from './APIAccessEntity'

@Entity('endpoint_dfsp')
export class EndpointDFSPEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ nullable: false })
    fspId!: string

  @Column({ nullable: false })
    dfsp_name!: string

  @ManyToOne(
    () => APIAccessEntity,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    api_access => api_access.endpoints
  )
    api_access!: APIAccessEntity

  @CreateDateColumn()
    created_at!: Date

  @UpdateDateColumn()
    updated_at!: Date
}
