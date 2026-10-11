import "server-only";
import Redis from "ioredis";

const url = process.env.REDIS_URL || "redis://localhost:6379";

const globalForRedis = globalThis as unknown as { __redis?: Redis };

export const redis =
  globalForRedis.__redis ??
  new Redis(url, {
    // Falha rápido em vez de enfileirar comandos quando o Redis está fora.
    maxRetriesPerRequest: 2,
    lazyConnect: false,
  });

redis.on("error", (err) => {
  console.error("[redis] erro de conexão:", err.message);
});

redis.on("connect", () => {
  console.log("[redis] conectado em", url);
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.__redis = redis;
}
