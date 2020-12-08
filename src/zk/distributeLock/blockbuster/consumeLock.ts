import { BlockbusterSdk } from "blockbuster-client-ts/dist/entry";
import { SearchScope } from "blockbuster-client-ts/dist";

const lockUri = "/jupiter/desktop/lock1";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const blockbusterSdk = new BlockbusterSdk("http://itop-xmn.lab.nordigy.ru:1389");

  let lease;

  while (!lease) {
    try {
      const response = await blockbusterSdk.leaseApi.createLease({
        uri: lockUri,
        duration: 900,
        scope: SearchScope.NUMBER_0,
      });

      lease = response.data;
    } catch (e) {

    }

    await sleep(1e3);
  }

  console.log(`${new Date()}>> start process...`);
  await sleep(10e3);
  console.log(`${new Date()}>> end process...`);

  await blockbusterSdk.leaseApi.removeLease(lease.id);
})();
