import type { Metadata } from "next";
import { config } from "@/lib/config";
import AdminForm from "@/components/AdminForm";

export const metadata: Metadata = {
  title: "Admin — Gerar link temporário",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <div className="admin-root">
      <AdminForm minMinutes={config.minMinutes} maxMinutes={config.maxMinutes} />
    </div>
  );
}
