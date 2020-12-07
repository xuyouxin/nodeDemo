import { Request, Response } from "express";
import { Lease } from "../entity/lease";
import { Ci } from "../entity/ci";
import * as moment from "moment";

import { sanitizeUri } from "./utils";
import { HttpError } from "../error-handler";
import { Semaphore } from "../utils";
import { ZKUtil } from "../zkUtil";

const leaseLock = new Semaphore(1);

async function findCandidates(uri: string, scope: number): Promise<Ci[]> {
  if (scope == 1) {
    const children = await ZKUtil.getChildren(uri);
    const cis = [];
    for (const child of children) {
      const temp = `${uri}/${child}`;
      const ci = JSON.parse(await ZKUtil.getData(temp)) as Ci;
      ci.leases = await findLeasesOfCi(ci);
      cis.push(ci);
    }
    return cis;
  } else {
    const ci = JSON.parse(await ZKUtil.getData(uri)) as Ci;
    ci.leases = await findLeasesOfCi(ci);
    return [ci];
  }
}

export async function findLeasesOfCi(ci: Ci): Promise<Lease[]> {
  const children = await ZKUtil.getChildren(`${ci.uri}/leases`);
  const leases: Lease[] = [];
  for (const id of children) {
    const leaseStr = await ZKUtil.getData(`${ci.uri}/leases/${id}`);
    const lease = JSON.parse(leaseStr) as Lease;
    lease.id = id;
    leases.push(lease);
  }
  return leases;
}

async function saveLease(uri: string, lease: Lease) {
  const timestamp = Date.now();
  if (!await ZKUtil.exists(`${uri}/leases`)) {
    await ZKUtil.createNode(`${uri}/leases`, undefined);
  }
  return await ZKUtil.createNode(`${uri}/leases/${timestamp}`, lease);
}

export class LeaseController {

  static addLease = async (req: Request, res: Response) => {
    let { duration = 60, uri, scope = 0 }: { duration: number, uri: string, scope: number } = req.body;
    uri = sanitizeUri(uri);

    if (!await ZKUtil.exists(uri)) {
      throw new HttpError(404, `${uri} not found`);
    }

    try {
      await leaseLock.wait();
      const ciCandidates = await findCandidates(uri, scope);
      if (!ciCandidates.length) throw new HttpError(404, "No CI can be leased!");

      const ciToLease = ciCandidates.find(ci => ci.leases.length < ci.maxLease);
      if (!ciToLease) throw new HttpError(409, "No free CI to lease, try again later!");

      const lease = new Lease();
      lease.expiredAfter = moment().add(duration, 's').toDate();
      const result = await saveLease(ciToLease.uri, lease);
      res.send({ result });
    } finally {
      leaseLock.signal();
    }
  };

  static deleteLease = async (req: Request, res: Response) => {

    let { uri }: { uri: string } = req.body;
    uri = sanitizeUri(uri);

    const leasePattern = /.*\/leases\/\d+/;
    if (!leasePattern.test(uri)) {
      throw new HttpError(400, `${uri} is not a lease uri`);
    }

    if (!await ZKUtil.exists(uri)) {
      throw new HttpError(404, `${uri} not found`);
    }

    const result = await ZKUtil.remove(uri);
    res.send({ result });
  };

  static updateLease = async (req: Request, res: Response) => {

    let { uri, renew }: { uri: string, renew: number } = req.body;

    uri = sanitizeUri(uri);

    const leasePattern = /.*\/leases\/\d+/;
    if (!leasePattern.test(uri)) {
      throw new HttpError(400, `${uri} is not a lease uri`);
    }

    if (!await ZKUtil.exists(uri)) {
      throw new HttpError(404, `${uri} not found`);
    }

    if (!renew || renew <= 0) {
      throw new HttpError(400, `Invalid renew ${renew}`);
    }

    const newLease: Lease = { expiredAfter: moment().add(renew, 's').toDate() } as Lease
    const result = await ZKUtil.setData(uri, newLease);
    res.send({ result });
  }
}
