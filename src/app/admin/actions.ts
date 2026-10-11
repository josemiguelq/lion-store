"use server";

import { headers } from "next/headers";
import { checkBasicAuth } from "@/lib/auth";
import { config } from "@/lib/config";
import { createLink } from "@/lib/links";
import { formatDateTime, formatDuration } from "@/lib/format";
import type { CreateLinkResult } from "@/lib/types";

export async function createLinkAction(
  _prev: CreateLinkResult | null,
  formData: FormData
): Promise<CreateLinkResult> {
  // Reforço de auth: o proxy cobre o Basic Auth, mas ele não é fronteira de segurança.
  const auth = (await headers()).get("authorization");
  if (!checkBasicAuth(auth)) {
    return { ok: false, error: "Autenticação necessária." };
  }

  const raw = Number(formData.get("minutes"));
  if (!Number.isFinite(raw) || raw <= 0) {
    return { ok: false, error: "Duração inválida." };
  }

  const { token, durationSeconds, expiresAt } = await createLink(Math.floor(raw));

  return {
    ok: true,
    url: `${config.baseUrl}/s/${token}`,
    label: formatDuration(durationSeconds / 60),
    expiresAtLabel: formatDateTime(new Date(expiresAt)),
  };
}
