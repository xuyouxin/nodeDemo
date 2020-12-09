import { createProvider } from "./provider";
import { sleep, ZKUtil } from "./zkUtil";

(async () => {
  let running = true;

  ZKUtil.init();

  const destroy = () => {
    //进行一些清理工作
    console.log("providerAAA zk disconnect...")
    ZKUtil.destroy();
    running = false;
  };

  process.on("exit", destroy);

  process.on('SIGINT', destroy);

  const result = await createProvider("com.foo.BarService", "10.32.35.172", {
    host: "10.32.35.172",
    port: 8080,
    methods: ["findGoods", "createOrder"]
  });

  console.log(`register providerAAA ${result ? "success" : "fail"}`)

  while (running) {
    await sleep(2e3);
  }
})();
