import { sleep, ZKUtil } from "./zkUtil";
import { findServices } from "./monitorUtils";

(async () => {
  ZKUtil.init();

  process.on("exit", function (code) {
    //进行一些清理工作
    console.log("monitor zk disconnect...");
    ZKUtil.destroy();
  });

  const out: any = {};
  await findServices(out);

  console.log("monitor start working");

  while (true) {
    console.log(new Date(), " all services>>", out.services);
    console.log(new Date(), " all providers>>", out.providers);
    console.log(new Date(), " all consumers>>", out.consumers);
    await sleep(10e3);
  }
})();

