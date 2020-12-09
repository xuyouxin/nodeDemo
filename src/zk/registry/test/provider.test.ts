import { createProvider, updateProvider } from "../src/provider";
import { findProviders } from "../src/monitorUtils";
import { ZKUtil } from "../src/zkUtil";

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

it('register provider to zk', async () => {

  const result = await createProvider("com.foo.BarService", "10.32.35.172", {
    host: "10.32.35.172",
    port: 8080,
    methods: ["findGoods", "createOrder"]
  });

  expect(result).toBeTruthy();

  const providers = await findProviders("com.foo.BarService", undefined);

  expect(providers[`10.32.35.172`]).toEqual({
    host: "10.32.35.172",
    port: 8080,
    methods: ["findGoods", "createOrder"]
  });
}, 100e3);

it('update provider', async () => {

  let result = await createProvider("com.foo.BarService", "10.32.35.116", {
    host: "10.32.35.116",
    port: 8085,
    methods: ["userComments", "userStars"]
  });

  expect(result).toBeTruthy();

  result = await updateProvider("com.foo.BarService", "10.32.35.116", {
    host: "10.32.35.116",
    port: 8086,
    methods: ["userComments", "userStars", "userCollect"]
  });

  expect(result).toBeTruthy();

  const providers = await findProviders("com.foo.BarService", undefined);

  expect(providers[`10.32.35.116`]).toEqual({
    host: "10.32.35.116",
    port: 8086,
    methods: ["userComments", "userStars", "userCollect"]
  });
}, 100e3);

