import "reflect-metadata";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import { router } from "./routes";
import { deleteExpiredLeasesInSchedule } from "./tasks/expiration";
import * as YAML from 'yaml';
import * as swaggerUi from "swagger-ui-express";
import * as fs from 'fs';
import * as swStats from "swagger-stats";
import { errorHandler } from "./error-handler";

const appEnv = process.env.APP_ENV || "development";

const apiSpec = YAML.parse(fs.readFileSync('./swagger.yml', 'utf8'));

export async function createServer(port: number = 8090) {
  // Create a new express application instance
  const app = express();

  // Call middleware
  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(bodyParser.json());

  //Set all routes from routes folder
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiSpec));
  app.use(router);
  app.use(errorHandler);
  if (appEnv === "production") {
    app.use(swStats.getMiddleware({ swaggerSpec: apiSpec }));
  }

  const server = app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
  });

  deleteExpiredLeasesInSchedule();

  return { app, server };
}
