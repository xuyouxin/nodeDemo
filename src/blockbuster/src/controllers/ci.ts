import { Request, Response } from "express";
import { Ci } from "../entity/ci";
import { getRepository } from "typeorm";
import { rsplit, Semaphore } from "../utils";
import { HttpError } from "../error-handler";
import { getFilterFn, getWhereClause, sanitizeUri } from "./utils";
import { isNullOrUndefined } from "util";

const ciLock = new Semaphore(1);

export async function getOrCreateUri(uri: string) {
  const names = uri.split('/');
  let ci: Ci = null;
  for (const name of names) {
    ci = await getOrCreateCiNode(name, ci?.id || '',)
  }
  return ci;
}

export async function createCiNode(name: string, parentId: string = '', maxLease: number = 0, data?: any) {
  const ciRepository = getRepository(Ci);
  let ci = new Ci();
  ci.data = data;
  ci.maxLease = maxLease;
  ci.parentId = parentId;
  ci.name = name;
  return ciRepository.save(ci, { transaction: false });
}

export async function getOrCreateCiNode(name: string, parentId: string = '', maxLease: number = 0, data?: any) {
  const ciRepository = getRepository(Ci);
  let ci: Ci;
  try {
    await ciLock.wait();
    ci = await ciRepository.findOne({ name, parentId });
    if (!ci) ci = await createCiNode(name, parentId, maxLease, data);
  } finally {
    ciLock.signal();
  }
  return ci;
}

export async function getCiNodeByUri(uri: string) {
  const ciRepository = getRepository(Ci);
  const names = uri.split('/');
  let ci: Ci = null;
  for (const name of names) {
    ci = await ciRepository.findOne({ name, parentId: ci?.id || '' });
    if (!ci) throw new HttpError(404, `URI not found: ${uri}!`)
  }
  return ci;
}

export async function getUriByCiNode(ci: Ci) {
  const ciRepository = getRepository(Ci);
  let uri = '';
  while (ci.parentId != '') {
    uri = '/' + ci.name + uri;
    ci = await ciRepository.findOne(ci.parentId);
  }
  return uri;
}

export class CiController {

  static getCis = async (req: Request, res: Response) => {
    let { uri, scope, filter }: { uri: string, scope: string, filter: string } = req.query as any;

    if (!uri || !scope) {
      throw new HttpError(400, `uri and scope can not be empty`);
    }

    const ciRepository = getRepository(Ci);
    let baseCi: Ci | null;
    if (uri) {
      uri = sanitizeUri(uri); // sanitize - 消毒，这里如果uri以/结尾，则会把它去掉
      baseCi = await getCiNodeByUri(uri);
    }
    let cis = await ciRepository.find({ where: getWhereClause(scope, baseCi?.id), relations: ['leases'] });
    const filterFn = getFilterFn(filter);
    if (filterFn) cis = cis.filter(filterFn);
    res.send(cis);
  };

  /**
   * 如果祖先节点不存在，会自动创建
   */
  static addCi = async (req: Request, res: Response) => {
    let { uri, data, maxLease }: { uri: string, data: any, maxLease: number } = req.body;
    uri = sanitizeUri(uri);

    const [base, name] = rsplit(uri, '/', 1);
    if (!name) throw new HttpError(400, `Cannot edit root: ${uri}`);
    const baseCi = await getOrCreateUri(base);
    let ci: Ci = null;
    try {
      await ciLock.wait();
      ci = await createCiNode(name, baseCi.id, maxLease, data);
    } catch (err) {
      throw (19 === err.errno) ? new HttpError(409, `Conflict: ${uri} already exists!`) : err;
    } finally {
      ciLock.signal();
    }
    res.send(ci);
  }

  static updateCi = async (req: Request, res: Response) => {
    const ciRepository = getRepository(Ci);
    const id = req.params.id;
    let ci = await ciRepository.findOne(id);
    if (!ci) throw new HttpError(404, `CI id not found`);
    let { uri, data, maxLease }: { uri: string, data: any, maxLease: number } = req.body;
    if (uri) {
      uri = sanitizeUri(uri);
      const [base, name] = rsplit(uri, '/', 1);
      if (!name) throw new HttpError(400, `Cannot edit root: ${uri}`);
      // ensure the target uri is not descendants of current CI
      const currentUri = await getUriByCiNode(ci);
      if (uri.startsWith(currentUri) && uri !== currentUri) throw new HttpError(400, `Cannot update URI to a lower level`);
      const baseCi = await getOrCreateUri(base);
      ci.parentId = baseCi.id;
      ci.name = name;
    }
    if (!isNullOrUndefined(data)) ci.data = data;
    if (!isNullOrUndefined(maxLease)) ci.maxLease = maxLease;
    try {
      ci = await ciRepository.save(ci, { transaction: false });
    } catch (err) {
      throw (19 === err.errno) ? new HttpError(409, `Conflict: ${uri} already exists!`) : err;
    }
    res.send(ci);
  }

  /**
   * 只能删除叶子节点
   */
  static deleteCi = async (req: Request, res: Response) => {
    const ciRepository = getRepository(Ci);
    const id = req.params.id;
    const ci = await ciRepository.findOne(id);
    if (ci) {
      const childCis = await ciRepository.find({ parentId: ci.id });
      if (childCis.length) {
        throw new HttpError(400, 'Cannot delete CI that has child CIs');
      }
    }
    await ciRepository.delete(id);
    res.sendStatus(204);
  }
}
