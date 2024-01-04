import {
    Entity,
    PrimaryGeneratedColumn, Column,
    OneToMany
} from 'typeorm'
import { CountrySubdivisionEntity } from './CountrySubdivisionEntity'

@Entity('mojaloopDfsps')
export class MojaloopDFSPEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ nullable: false, length: 255 })
    dfsp_id!: string

    @Column({ nullable: false, length: 255 })
    dfsp_name!: string
}
