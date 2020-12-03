import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from "typeorm";
import { Ci } from "./ci";

@Entity()
export class Lease {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index()
    @Column("datetime")
    expiredAfter: Date;

    @ManyToOne(type => Ci, ci => ci.leases, { onDelete: 'CASCADE' })
    ci: Ci;
}
