import next from "next";
import * as os from "os";
import * as cluster from "cluster";
import { parse } from "url";
import fastify from "fastify";

const dev = process.env.NODE_ENV !== "production";
const clusterSize = Math.min(os.cpus().length, 4);
const portNumber = 3000;

if (cluster.isMaster) {
  for (let i = 0; i < clusterSize; i++) cluster.fork({ INDEX: i });
} else {
  const app = next({ dev });
  const handle = app.getRequestHandler();
  const server = fastify();
  app.prepare().then(() => {
    server.all("*", (req, res) => {
      return handle(req.raw, res.raw, parse(req.url, true));
    });
    server.listen(portNumber).then(() => {
      console.log(`[${process.env.INDEX}]:http://localhost:${portNumber}`);
    });
  });
}
