import { findServices } from "../src/monitorUtils";
import { sleep, ZKUtil } from "../src/zkUtil";
import { createProvider, deleteProvider, updateProvider } from "../src/provider";
import { createConsumer } from "../src/consumer";
import * as path from "path";

const { spawn, exec } = require('child_process');

beforeAll(async () => {
  ZKUtil.init();
});

afterAll(async () => {
  ZKUtil.destroy();
});

beforeEach(async () => {
  await ZKUtil.clearAllData("/dubbo");
});

afterEach(async () => {
  await ZKUtil.clearAllData("/dubbo");
});

async function waitEventLoop() {
  await sleep(10); // nodejs是单线程模型，这边等1毫秒，是防止更新的回调事件被放到判断之后执行
}

const data1 = {
  host: "10.32.35.116",
  port: 8085,
  methods: ["userComments", "userStars"]
};

const data2 = {
  host: "10.32.35.172",
  port: 8080,
  methods: ["findGoods", "createOrder"]
};

const data3 = {
  host: "10.32.35.158",
  port: 8080,
  methods: ["search", "launchDistribution"]
};

it('monitor create provider', async () => {

  const out: any = {};
  await findServices(out);

  expect(out.services).toEqual([]);
  expect(out.providers).toBeUndefined();

  // create provider one
  let result = await createProvider("com.foo.BarService", data1.host, data1);

  expect(result).toBeTruthy();

  await waitEventLoop();

  expect(out.providers["com.foo.BarService"]).toEqual({ [data1.host]: data1 });


  // create provider two
  result = await createProvider("com.foo.BarService", data2.host, data2);

  expect(result).toBeTruthy();

  await waitEventLoop();

  expect(out.providers["com.foo.BarService"]).toEqual({ [data1.host]: data1, [data2.host]: data2 });


  // create provider three
  result = await createProvider("com.logistics.XXXService", data3.host, data3);

  expect(result).toBeTruthy();

  await waitEventLoop();

  expect(out.providers["com.foo.BarService"]).toEqual({ [data1.host]: data1, [data2.host]: data2 });
  expect(out.providers["com.logistics.XXXService"]).toEqual({ [data3.host]: data3 });

}, 100e3);


it('monitor delete provider', async () => {

  const out: any = {};
  await findServices(out);

  expect(out.services).toEqual([]);
  expect(out.providers).toBeUndefined();

  // create there providers

  await createProvider("com.foo.BarService", data1.host, data1);

  await createProvider("com.foo.BarService", data2.host, data2);

  await createProvider("com.logistics.XXXService", data3.host, data3);

  // check before delete
  await waitEventLoop();
  expect(out.providers["com.foo.BarService"]).toEqual({ [data1.host]: data1, [data2.host]: data2 });
  expect(out.providers["com.logistics.XXXService"]).toEqual({ [data3.host]: data3 });

  // delete one
  let result = await deleteProvider(`/dubbo/com.foo.BarService/providers/${data1.host}`);
  expect(result).toBeTruthy();

  await waitEventLoop();
  expect(out.providers["com.foo.BarService"]).toEqual({ [data2.host]: data2 });
  expect(out.providers["com.logistics.XXXService"]).toEqual({ [data3.host]: data3 });

  // delete two
  result = await deleteProvider(`/dubbo/com.foo.BarService/providers/${data2.host}`);
  expect(result).toBeTruthy();

  await waitEventLoop();
  expect(out.providers["com.foo.BarService"]).toEqual({});
  expect(out.providers["com.logistics.XXXService"]).toEqual({ [data3.host]: data3 });

  // delete three
  result = await deleteProvider(`/dubbo/com.logistics.XXXService/providers/${data3.host}`);
  expect(result).toBeTruthy();

  await waitEventLoop();
  expect(out.providers["com.foo.BarService"]).toEqual({});
  expect(out.providers["com.logistics.XXXService"]).toEqual({});

}, 100e3);

it('monitor update provider data', async () => {
  const out: any = {};
  await findServices(out);

  expect(out.services).toEqual([]);
  expect(out.providers).toBeUndefined();

  // create there providers

  await createProvider("com.foo.BarService", data1.host, data1);

  await createProvider("com.foo.BarService", data2.host, data2);

  await createProvider("com.logistics.XXXService", data3.host, data3);

  // check before delete
  await waitEventLoop();
  expect(out.providers["com.foo.BarService"]).toEqual({ [data1.host]: data1, [data2.host]: data2 });
  expect(out.providers["com.logistics.XXXService"]).toEqual({ [data3.host]: data3 });

  // update provider data
  const newData = {
    host: "10.32.35.116",
    port: 8086,
    methods: ["userComments", "userStars", "userCollect"]
  };
  let result = await updateProvider("com.foo.BarService", data1.host, newData);

  expect(result).toBeTruthy();

  await waitEventLoop();
  expect(out.providers["com.foo.BarService"]).toEqual({ [data1.host]: newData, [data2.host]: data2 });
  expect(out.providers["com.logistics.XXXService"]).toEqual({ [data3.host]: data3 });

}, 100e3);

const consumerOne = {
  host: "10.32.35.101",
  port: 8080,
};

it('monitor create consumers', async () => {

  const out: any = {};
  await findServices(out);

  expect(out.services).toEqual([]);
  expect(out.consumers).toBeUndefined();

  // create consumer one
  let result = await createConsumer("com.foo.BarService", consumerOne.host, consumerOne);

  expect(result).toBeTruthy();

  await waitEventLoop();

  expect(out.consumers["com.foo.BarService"]).toEqual({ [consumerOne.host]: consumerOne });

}, 100e3);

/**
 * monitor delete consumer and update consumer data is likely to the same operations to provider
 */

/**
 * The defect of the unit test is that, it doesn't test the occasion that a process/thread register a Provider/Consumer to zk,
 * and then the process/thread is exited or it is killed, the registration will be removed by zk automatically.
 * So add the follow case.
 */
it('registration will be removed automatically when client is down or process is killed', async () => {

  const out: any = {};
  await findServices(out);

  expect(out.services).toEqual([]);
  expect(out.providers).toBeUndefined();

  // create a provider in child process
  const consume = path.resolve(__dirname, "providerToTest.ts");
  const ps = spawn('ts-node', [consume]);

  await sleep(5e3); // have some delay

  expect(out.providers["com.foo.BarService"]).toEqual({ [data1.host]: data1 });

  // some time later, the registration still exists
  await sleep(10e3);
  expect(out.providers["com.foo.BarService"]).toEqual({ [data1.host]: data1 });

  // kill the child process
  ps.kill("SIGINT");

  await sleep(10e3); // have some delay
  expect(out.providers["com.foo.BarService"]).toEqual({});

}, 100e3);
