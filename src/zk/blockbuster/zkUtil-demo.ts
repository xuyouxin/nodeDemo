import { ZKUtil } from "./src/zkUtil";

(async () => {
  ZKUtil.init();

  // const result = await zk.removeRecursive("/jupiter");
  // console.log(result);
  //
  // console.log(await ZKUtil.getChildren("/jupiter/desktop/mac"))
  //
  // const children = await ZKUtil.getChildren("/");
  // for (const name of children) {
  //   if (name != "zookeeper") {
  //     await ZKUtil.removeRecursive(`/${name}`);
  //   }
  // }

  // console.log(await ZKUtil.getData("/jupiter/desktop/mac"));

  console.log(await ZKUtil.exists("/jupiter/desktop/mac/100"));

  ZKUtil.destroy();
})();
