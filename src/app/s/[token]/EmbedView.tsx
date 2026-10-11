"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/brand";

function format(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export default function EmbedView({
  token,
  remainingMs,
}: {
  token: string;
  remainingMs: number;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [expired, setExpired] = useState(remainingMs <= 0);
  const [display, setDisplay] = useState("--:--");
  const [level, setLevel] = useState<"" | "warning" | "danger">("");
  const deadlineRef = useRef(Date.now() + remainingMs);

  // O endereço real da loja só é buscado no cliente, depois que o servidor
  // valida o token. Assim ele não aparece no HTML renderizado.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/target/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { url?: string }) => {
        if (!cancelled && data.url) setSrc(data.url);
      })
      .catch(() => {
        if (!cancelled) setExpired(true);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (expired) return;
    let timer: number | undefined;

    const tick = () => {
      const left = Math.max(0, deadlineRef.current - Date.now());
      const sec = Math.ceil(left / 1000);
      setDisplay(format(sec));
      setLevel(left <= 30000 ? "danger" : left <= 120000 ? "warning" : "");
      if (left <= 0) {
        setDisplay("00:00");
        setExpired(true);
        return;
      }
      timer = window.setTimeout(tick, 250);
    };

    tick();
    return () => window.clearTimeout(timer);
  }, [expired]);

  return (
    <div className="embed-root">
      <header className="bar">
        <div className="brand">
          {BRAND} <span>· oferta exclusiva</span>
        </div>
        <div className="timer">
          <span className="label">Expira em</span>
          <span className={`clock ${level}`}>{display}</span>
        </div>
      </header>

      <main className="embed-main">
        {src && (
          <iframe
            src={src}
            referrerPolicy="no-referrer-when-downgrade"
            allow="payment; clipboard-write"
            title={BRAND}
          />
        )}
      </main>

      <div id="expiredOverlay" style={{ display: expired ? "flex" : "none" }}>
        <div className="icon">⏳</div>
        <h1>O tempo acabou</h1>
        <p>
          O prazo para concluir sua compra por este link expirou. Fale com o
          vendedor para receber um novo link.
        </p>
      </div>
    </div>
  );
}
