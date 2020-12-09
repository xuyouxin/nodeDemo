import { createProvider, updateProvider } from "./provider";
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

  let result = await createProvider("com.foo.BarService", "10.32.35.116", {
    host: "10.32.35.116",
    port: 8085,
    methods: ["userComments", "userStars"]
  });

  console.log(`register providerBBB ${result ? "success" : "fail"}`);

  await sleep(25e3);

  result = await updateProvider("com.foo.BarService", "10.32.35.116", {
    host: "10.32.35.116",
    port: 8086,
    methods: ["userComments", "userStars", "userCollect"]
  });

  console.log(`update providerBBB ${result ? "success" : "fail"}`);

  while (running) {
    await sleep(2e3);
  }

})();
