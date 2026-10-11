import type { Metadata } from "next";
import { getRemainingMs } from "@/lib/links";
import { BRAND } from "@/lib/brand";
import Expired from "@/components/Expired";
import EmbedView from "./EmbedView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${BRAND} — Oferta por tempo limitado`,
  robots: { index: false, follow: false },
};

export default async function TokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const remainingMs = await getRemainingMs(token);

  if (remainingMs <= 0) return <Expired />;

  return <EmbedView token={token} remainingMs={remainingMs} />;
}
