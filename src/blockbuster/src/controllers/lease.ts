import { Request, Response } from "express";
import { getRepository, MoreThan } from "typeorm";
import { Lease } from "../entity/lease";
import { Ci } from "../entity/ci";
import { getCiNodeByUri } from "./ci";
import * as moment from "moment";

import { sanitizeUri, getWhereClause, getFilterFn } from "./utils";
import { HttpError } from "../error-handler";
import { Semaphore } from "../utils";

const leaseLock = new Semaphore(1);

export class LeaseController {
    static listAll = async (req: Request, res: Response) => {
        const leaseRepository = getRepository(Lease);
        const leases = await leaseRepository.find({ where: {}, relations: ['ci'] });
        res.status(200).send(leases);
    };

    static addLease = async (req: Request, res: Response) => {
        let { duration = 60, uri, scope = 0, filter }: { duration: number, uri: string, scope: number, filter: string } = req.body;
        uri = sanitizeUri(uri);

        const leaseRepository = getRepository(Lease);
        const ciRepository = getRepository(Ci);

        const filterFn = getFilterFn(filter);
        const baseCi = await getCiNodeByUri(uri);

        let lease: Lease;
        try {
            await leaseLock.wait();
            let ciCandidates = await ciRepository.find({ where: { maxLease: MoreThan(0), ...getWhereClause(scope, baseCi.id) }, relations: ['leases'] });
            if (filterFn) ciCandidates = ciCandidates.filter(filterFn);
            if (!ciCandidates.length) throw new HttpError(404, "No CI can be leased!")
            const ciToLease = ciCandidates.find(ci => ci.leases.length < ci.maxLease);
            if (!ciToLease) throw new HttpError(409, "No free CI to lease, try again later!");
            lease = new Lease();
            lease.ci = ciToLease;
            lease.expiredAfter = moment().add(duration, 's').toDate();
            lease = await leaseRepository.save(lease, { transaction: false });
        } finally {
            leaseLock.signal();
        }
        res.send(lease);
    };

    static deleteLease = async (req: Request, res: Response) => {
        const id = req.params.id;
        const leaseRepository = getRepository(Lease);
        await leaseRepository.delete(id);
        res.sendStatus(204);
    };

    static updateLease = async (req: Request, res: Response) => {
        const id = req.params.id;
        const leaseRepository = getRepository(Lease);
        if (!await leaseRepository.findOne(id)) {
            throw new HttpError(404, 'Lease not found');
        }
        let { renew }: { renew: number } = req.body;
        if (!renew || renew <= 0) throw new HttpError(400, `Invalid renew ${renew}`);
        await leaseRepository.update(id, { expiredAfter: moment().add(renew, 's').toDate() });
        res.status(200).send('Success to update a lease.');
    }
}
