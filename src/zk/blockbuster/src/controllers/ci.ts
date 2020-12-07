import { Request, Response } from "express";
import { rsplit } from "../utils";
import { HttpError } from "../error-handler";
import { sanitizeUri } from "./utils";
import { isNullOrUndefined } from "util";
import { Ci } from "../entity/ci";
import { ZKUtil } from "../zkUtil";
import { findLeasesOfCi } from "./lease";

export async function createBaseIfNotExists(base: string) {
  if (!await ZKUtil.exists(base)) {
    await ZKUtil.mkdirp(base);
  }
}

export async function createCiNode(uri: string, maxLease: number = 0, data?: any) {
  const ci: Ci = {
    uri,
    data,
    maxLease
  };
  return ZKUtil.createNode(uri, ci);
}

export async function getCiData(uri: string): Promise<Ci> {
  const data = await ZKUtil.getData(uri);
  if (data && data != "{}") {
    return JSON.parse(data) as Ci;
  } else {
    return undefined;
  }
}

export class CiController {

  static getCis = async (req: Request, res: Response) => {
    let { uri, scope }: { uri: string, scope: number } = req.query as any;

    if (!uri || !scope || (scope != 0 && scope != 1)) {
      throw new HttpError(400, `uri and scope can not be empty`);
    }

    uri = sanitizeUri(uri); // sanitize - 消毒，这里如果uri以/结尾，则会把它去掉
    if (scope == 0) {
      const ci = await getCiData(uri);

      if (!ci) {
        throw new HttpError(404, `URI not found: ${uri}`);
      }
      ci.leases = await findLeasesOfCi(ci);
      res.send([ci]);
      return;
    }

    if (scope == 1) {
      const children = await ZKUtil.getChildren(uri);

      if (children.length == 0) {
        throw new HttpError(404, `URI not found: ${uri}`);
      }

      const cis: Ci[] = [];
      for (const name of children) {
        const ci = await getCiData(`${uri}/${name}`);
        ci.leases = await findLeasesOfCi(ci);
        cis.push(ci);
      }

      res.send(cis);
      return;
    }
  };

  /**
   * 如果祖先节点不存在，会自动创建
   */
  static addCi = async (req: Request, res: Response) => {
    let { uri, data, maxLease }: { uri: string, data: any, maxLease: number } = req.body;
    uri = sanitizeUri(uri);

    const [base, name] = rsplit(uri, '/', 1);
    if (!name) throw new HttpError(400, `Cannot edit root: ${uri}`);

    if (await ZKUtil.exists(uri)) {
      throw new HttpError(409, `the CI already exists`);
    }

    await createBaseIfNotExists(base);
    const result = await createCiNode(uri, maxLease, data);
    res.send({ result });
  };

  /**
   *  only can update data and maxLease, can not update uri
   */
  static updateCi = async (req: Request, res: Response) => {

    let { uri, data, maxLease }: { uri: string, data: any, maxLease: number } = req.body;
    uri = sanitizeUri(uri);

    let [base, name] = rsplit(uri, '/', 1);
    if (!name) throw new HttpError(400, `Cannot edit root: ${uri}`);

    if (!await ZKUtil.exists(uri)) {
      throw new HttpError(404, `CI id not found`);
    }

    const ci = JSON.parse(await ZKUtil.getData(uri)) as Ci;
    if (!isNullOrUndefined(data)) ci.data = data;
    if (!isNullOrUndefined(maxLease)) ci.maxLease = maxLease;

    const result = await ZKUtil.setData(uri, ci);
    res.send({ result });
  };

  /**
   * 只能删除叶子节点
   */
  static deleteCi = async (req: Request, res: Response) => {

    let { uri }: { uri: string, data: any, maxLease: number } = req.body;
    uri = sanitizeUri(uri);

    const [base, name] = rsplit(uri, '/', 1);
    if (!name) throw new HttpError(400, `Cannot edit root: ${uri}`);

    if (!await ZKUtil.exists(uri)) {
      throw new HttpError(404, `CI id not found`);
    }

    const children = await ZKUtil.getChildren(uri);
    if (children.length > 0) {
      throw new HttpError(400, 'Cannot delete CI that has child CIs');
    }

    const result = await ZKUtil.remove(uri);
    res.send({ result });
  }
}
