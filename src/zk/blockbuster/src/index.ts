import { createServer } from "./server";
import { ZKUtil } from "./zkUtil";


(async () => {
  ZKUtil.init();

  const { app, server } = await createServer();

  app.once("close", () => {
    ZKUtil.destroy();
  });
})();
