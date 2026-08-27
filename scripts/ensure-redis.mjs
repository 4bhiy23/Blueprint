import { createConnection } from "node:net";
import { spawn } from "node:child_process";

function getRedisEndpoint() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return { host: "127.0.0.1", port: 6379 };

  const url = new URL(redisUrl);
  return { host: url.hostname, port: Number(url.port || 6379) };
}

function isReachable({ host, port }) {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port });
    const finish = (ready) => {
      socket.destroy();
      resolve(ready);
    };

    socket.setTimeout(750);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

function startCompose() {
  return new Promise((resolve, reject) => {
    const compose = spawn(
      "docker",
      ["compose", "-f", "compose.redis.yml", "up", "-d", "--wait"],
      { stdio: "inherit" },
    );

    compose.once("error", reject);
    compose.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Docker Compose exited with code ${code}.`));
    });
  });
}

const endpoint = getRedisEndpoint();
if (await isReachable(endpoint)) {
  console.log(`Redis is already available at ${endpoint.host}:${endpoint.port}.`);
} else {
  console.log(`Starting local Redis at ${endpoint.host}:${endpoint.port}…`);
  await startCompose();
}
