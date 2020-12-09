import { sleep, ZKUtil } from "../src/zkUtil";
import { createProvider } from "../src/provider";

const data1 = {
  host: "10.32.35.116",
  port: 8085,
  methods: ["userComments", "userStars"]
};

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

  const result = await createProvider("com.foo.BarService", data1.host, data1);

  console.log(`register providerAAA ${result ? "success" : "fail"}`);

  while (running) {
    await sleep(2e3);
  }
})();
