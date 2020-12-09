import { ZKUtil } from "./zkUtil";
import { CreateMode } from "node-zookeeper-client";


export async function createProvider(service: string, url: string, data: any): Promise<boolean> {
  const providers = `/dubbo/${service}/providers`;
  if (!await ZKUtil.exists(providers)) {
    await ZKUtil.mkdirp(providers)
  }

  const uri = `${providers}/${url}`;
  return await ZKUtil.createNode(uri, data, CreateMode.EPHEMERAL);
}

export async function updateProvider(service: string, url: string, data: any): Promise<boolean> {
  const uri = `/dubbo/${service}/providers/${url}`;
  if (!await ZKUtil.exists(uri)) {
    throw Error(`can not find the ${uri}`);
  }

  return await ZKUtil.setData(uri, data);
}

export async function deleteProvider(uri: string) {
  return await ZKUtil.remove(uri);
}
