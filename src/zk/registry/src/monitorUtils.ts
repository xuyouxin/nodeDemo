import { Event } from "node-zookeeper-client";
import { ZKUtil } from "./zkUtil";

export async function findProvidersAndWatchIt(service: string, out: { providers: any }) {
  out.providers = out.providers || {};
  out.providers[service] = await findProviders(service, event => {
    console.log(event);
    findProvidersAndWatchIt(service, out).then(() => {
      console.log("update all providers>>", out.providers);
    })
  });
}

export async function findProviders(service: string, watcher: (event: Event) => void) {

  const providers: any = {};

  const children = await ZKUtil.getChildren(`/dubbo/${service}/providers`, watcher);

  for (const name of children) {
    // providers[name] = await findProviderData(`/dubbo/${service}/providers/${name}`, undefined);
    await findProviderDataAndWatchIt(service, name, providers);
  }

  return providers;
}

async function findProviderData(provider: string, watcher: (event: Event) => void) {
  const str = await ZKUtil.getData(provider, watcher);
  return JSON.parse(str);
}

async function findProviderDataAndWatchIt(service: string, name: string, providers: any) {
  providers[name] = await findProviderData(`/dubbo/${service}/providers/${name}`, event => {
    if (event.name == "NODE_DATA_CHANGED") {
      console.log(event);
      findProviderDataAndWatchIt(service, name, providers).then(() => {
        console.log("update one provider>>", providers);
      });
    }
  });
}



export async function findConsumersAndWatchIt(service: string, out: { consumers: any }) {
  out.consumers = out.consumers || {};
  out.consumers[service] = await findConsumers(service, event => {
    console.log(event);
    findConsumersAndWatchIt(service, out).then(() => {
      console.log("update all consumer>>", out.consumers);
    })
  });
}

export async function findConsumers(service: string, watcher: (event: Event) => void) {

  const consumers: any = {};

  const children = await ZKUtil.getChildren(`/dubbo/${service}/consumers`, watcher);

  for (const name of children) {
    await findConsumerDataAndWatchIt(service, name, consumers);
  }

  return consumers;
}

async function findConsumerData(consumer: string, watcher: (event: Event) => void) {
  const str = await ZKUtil.getData(consumer, watcher);
  return JSON.parse(str);
}

async function findConsumerDataAndWatchIt(service: string, name: string, consumers: any) {
  consumers[name] = await findConsumerData(`/dubbo/${service}/consumers/${name}`, event => {
    if (event.name == "NODE_DATA_CHANGED") {
      console.log(event);
      findConsumerDataAndWatchIt(service, name, consumers).then(() => {
        console.log("update one consumer>>", consumers);
      });
    }
  });
}

export async function findServices(out: { services: any, providers: any, consumers: any }) {
  out.services = await ZKUtil.getChildren("/dubbo", event1 => {
    out.providers = {};
    findServices(out).then(() => {
      console.log("service updated>>", out.services);
    })
  });

  for (const service of out.services) {
    await findProvidersAndWatchIt(service, out);

    await findConsumersAndWatchIt(service, out);
  }
}
