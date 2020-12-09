import { sleep, ZKUtil } from "./zkUtil";
import { createConsumer } from "./consumer";
import { findProvidersAndWatchIt } from "./monitorUtils";

(async () => {
  ZKUtil.init();

  const result = await createConsumer("com.foo.BarService", "10.32.35.101", {
    host: "10.32.35.101",
    port: 8080,
  });

  console.log(`register consumer101 ${result ? "success" : "fail"}`);

  const out: any = {};
  await findProvidersAndWatchIt("com.foo.BarService", out);

  console.log(out.providers);

  await sleep(21e3);

  console.log("consumer101 zk disconnect...");
  ZKUtil.destroy();
})();
