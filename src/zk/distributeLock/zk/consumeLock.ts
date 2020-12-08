import { ZKUtil } from "./zkUtil";
import { CreateMode } from "node-zookeeper-client";

const lockUri = "/jupiter/desktop/lock1";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  ZKUtil.init();

  while (!await ZKUtil.createNode(lockUri, undefined, CreateMode.EPHEMERAL)) {
    await sleep(1e3);
  }

  console.log(`${new Date()}>> start process...`);
  await sleep(10e3);
  console.log(`${new Date()}>> end process...`);

  ZKUtil.destroy();
})();
