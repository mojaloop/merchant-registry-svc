import {
       Entity, 
       PrimaryGeneratedColumn, 
       CreateDateColumn, 
       UpdateDateColumn,
       Column
      } from 'typeorm'


@Entity('onboarded_dfsps')
export class DFSPOnboardEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ nullable: false, length: 255 })
    name!: string

    @Column({ nullable: false, length: 255 })
    fspId!: string
    
    @Column({ nullable: false, length: 255 })
    license_number!: string

    @Column({ nullable: false, length: 512 })
    logo_uri!: string
    
    @Column({ nullable: false, length: 3})
    will_use_portal!: string
    
    @CreateDateColumn()                                                     
    created_at!: Date

    @UpdateDateColumn()
    updated_at!: Date
}
