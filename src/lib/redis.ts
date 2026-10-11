import "server-only";
import Redis from "ioredis";

function sanitize(u: string): string {
  try {
    const parsed = new URL(u);
    if (parsed.password) parsed.password = "***";
    return parsed.toString();
  } catch {
    return u;
  }
}

const url = process.env.REDIS_URL?.trim();

if (!url) {
  console.error(
    "[redis] REDIS_URL não definida. Configure a variável de ambiente (no Vercel: " +
      "Project → Settings → Environment Variables) e faça redeploy."
  );
}

// Em produção exigimos REDIS_URL explícita; em dev caímos no localhost.
const connectionUrl = url || "redis://localhost:6379";

const globalForRedis = globalThis as unknown as { __redis?: Redis };

export const redis =
  globalForRedis.__redis ??
  new Redis(connectionUrl, {
    // Falha após algumas tentativas em vez de enfileirar comandos para sempre.
    maxRetriesPerRequest: 3,
    connectTimeout: 10_000,
    retryStrategy: (times) => Math.min(times * 100, 2_000),
    enableReadyCheck: true,
  });

redis.on("error", (err) => {
  console.error("[redis] erro de conexão:", err.message);
});

redis.on("connect", () => {
  console.log("[redis] conectado em", sanitize(connectionUrl));
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.__redis = redis;
}
