import { createServer } from "../src/server";


export async function connectToDbAndCreateApp() {

  const randomPort = 8000 + Math.floor(1000 * Math.random());
  const { app, server } = await createServer(randomPort);

  return { app, server };
}
