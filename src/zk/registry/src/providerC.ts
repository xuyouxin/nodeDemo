import { createProvider } from "./provider";
import { sleep, ZKUtil } from "./zkUtil";

(async () => {
  let running = true;

  ZKUtil.init();

  const destroy = () => {
    //进行一些清理工作
    console.log("providerCCC zk disconnect...")
    ZKUtil.destroy();
    running = false;
  };

  process.on("exit", destroy);

  process.on('SIGINT', destroy);

  const result = await createProvider("com.logistics.XXXService", "10.32.35.158", {
    host: "10.32.35.158",
    port: 8080,
    methods: ["search", "launchDistribution"]
  });

  console.log(`register providerCCC ${result ? "success" : "fail"}`);


  while (running) {
    await sleep(2e3);
  }
})();
