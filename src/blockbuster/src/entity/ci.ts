import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany } from "typeorm";
import { Lease } from "./lease";

@Entity()
@Index(["parentId", "name"], { unique: true })
export class Ci {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false, default: '' })
    parentId: string;

    @Column({ nullable: false, default: '' })
    name: string;

    @Column("simple-json", { nullable: true })
    data?: {};

    @Column({ nullable:false, default: 0 })
    maxLease: number;

    @OneToMany(type => Lease, lease => lease.ci)
    leases: Lease[];
}
