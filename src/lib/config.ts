import "server-only";

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value !== undefined && value !== "" ? parsed : fallback;
}

export const config = {
  baseUrl: (
    process.env.BASE_URL || `http://localhost:${num(process.env.PORT, 3000)}`
  ).replace(/\/$/, ""),
  targetUrl: process.env.TARGET_URL || "https://liondistribuidora.com.br/",
  adminUser: process.env.ADMIN_USER || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  minMinutes: num(process.env.MIN_MINUTES, 1),
  maxMinutes: num(process.env.MAX_MINUTES, 1440),
};

if (!config.adminPassword || config.adminPassword === "troque-esta-senha") {
  console.warn(
    "[aviso] ADMIN_PASSWORD não definida (ou padrão). Defina uma senha forte no .env antes de usar em produção."
  );
}
