import * as fs from "fs";
import * as path from "path";
import { createConnection } from "typeorm";
import { createServer } from "../../src/server";

export function deleteDbIfExists() {
  const dbPath = path.resolve(__dirname, "../../database-test.sqlite");
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
}

export async function connectToDbAndCreateApp() {

  const connection = await createConnection({
    "type": "sqlite",
    "database": "database-test.sqlite",
    "synchronize": true,
    "entities": [
      "src/entity/**/*.ts"
    ],
    "migrations": [
      "src/migration/**/*.ts"
    ],
    "subscribers": [
      "src/subscriber/**/*.ts"
    ],
    "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
    }
  });

  const randomPort = 8000 + Math.floor(1000 * Math.random());
  const { app, server } = await createServer(randomPort);

  return { app, server, connection };
}
