import { createServer } from "./server";
import { createConnection } from "typeorm";


(async () => {
  await createConnection();
  await createServer();
})();
