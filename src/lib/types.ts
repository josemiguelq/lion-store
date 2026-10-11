export type CreateLinkResult =
  | { ok: true; url: string; label: string; expiresAtLabel: string }
  | { ok: false; error: string };
