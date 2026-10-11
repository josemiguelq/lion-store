import "server-only";
import crypto from "node:crypto";
import { redis } from "./redis";
import { config } from "./config";

export interface CreatedLink {
  token: string;
  durationSeconds: number;
  expiresAt: number;
}

export async function createLink(minutes: number): Promise<CreatedLink> {
  const clamped = Math.max(
    config.minMinutes,
    Math.min(config.maxMinutes, Math.floor(minutes))
  );
  const durationSeconds = clamped * 60;
  const token = crypto.randomBytes(16).toString("base64url");
  const now = Date.now();
  const expiresAt = now + durationSeconds * 1000;

  const payload = JSON.stringify({ createdAt: now, expiresAt, durationSeconds });
  await redis.set(`link:${token}`, payload, "EX", durationSeconds);

  return { token, durationSeconds, expiresAt };
}

/** Retorna o tempo restante em ms, ou 0 se o token não existe / expirou. */
export async function getRemainingMs(token: string): Promise<number> {
  const key = `link:${token}`;
  const [raw, pttl] = await Promise.all([redis.get(key), redis.pttl(key)]);

  // pttl: -2 = não existe, -1 = sem expiração (não deve ocorrer aqui)
  if (!raw || pttl <= 0) return 0;
  return pttl;
}
