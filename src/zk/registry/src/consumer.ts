import { ZKUtil } from "./zkUtil";
import { CreateMode, Event } from "node-zookeeper-client";


export async function createConsumer(service: string, url: string, data: any): Promise<boolean> {
  const consumers = `/dubbo/${service}/consumers`;
  if (!await ZKUtil.exists(consumers)) {
    await ZKUtil.mkdirp(consumers)
  }

  const uri = `${consumers}/${url}`;
  return await ZKUtil.createNode(uri, data, CreateMode.EPHEMERAL);
}

