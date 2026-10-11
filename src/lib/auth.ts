import "server-only";
import crypto from "node:crypto";
import { config } from "./config";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function checkBasicAuth(authorization: string | null | undefined): boolean {
  // Sem senha configurada, bloqueia todo mundo (evita acesso aberto acidental).
  if (!config.adminPassword) return false;
  if (!authorization) return false;

  const [scheme, encoded] = authorization.split(" ");
  if (scheme !== "Basic" || !encoded) return false;

  let decoded: string;
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return false;
  }

  const sep = decoded.indexOf(":");
  if (sep === -1) return false;

  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);

  return safeEqual(user, config.adminUser) && safeEqual(pass, config.adminPassword);
}
