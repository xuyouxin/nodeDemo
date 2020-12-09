import { findConsumers, findProvidersAndWatchIt } from "../src/monitorUtils";
import { sleep, ZKUtil } from "../src/zkUtil";
import { createConsumer } from "../src/consumer";
import { createProvider, updateProvider } from "../src/provider";

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

it('register consumer to zk', async () => {

  const result = await createConsumer("com.foo.BarService", "10.32.35.101", {
    host: "10.32.35.101",
    port: 8080,
  });

  expect(result).toBeTruthy();

  const consumers = await findConsumers("com.foo.BarService", undefined);

  expect(consumers[`10.32.35.101`]).toEqual({
    host: "10.32.35.101",
    port: 8080,
  });
}, 100e3);

it('consumer can watch out the provider\' change', async () => {

  const oldData = {
    host: "10.32.35.116",
    port: 8085,
    methods: ["userComments", "userStars"]
  };
  let result = await createProvider("com.foo.BarService", "10.32.35.116", oldData);

  expect(result).toBeTruthy();


  const out: any = {};
  await findProvidersAndWatchIt("com.foo.BarService", out);

  expect(out.providers["com.foo.BarService"]).toEqual({ "10.32.35.116": oldData });

  const newData = {
    host: "10.32.35.116",
    port: 8086,
    methods: ["userComments", "userStars", "userCollect"]
  };
  result = await updateProvider("com.foo.BarService", "10.32.35.116", newData);

  expect(result).toBeTruthy();

  await sleep(1); // nodejs是单线程模型，这边等1毫秒，是防止更新的回调事件被放到判断之后执行

  expect(out.providers["com.foo.BarService"]).toEqual({ "10.32.35.116": newData });
}, 100e3);
