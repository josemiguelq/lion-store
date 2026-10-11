"use client";

import { useActionState, useRef } from "react";
import { createLinkAction } from "@/app/admin/actions";
import type { CreateLinkResult } from "@/lib/types";

export default function AdminForm({
  minMinutes,
  maxMinutes,
}: {
  minMinutes: number;
  maxMinutes: number;
}) {
  const [state, formAction, pending] = useActionState<CreateLinkResult | null, FormData>(
    createLinkAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);

  function setMinutes(m: number) {
    if (minutesRef.current) minutesRef.current.value = String(m);
    formRef.current?.requestSubmit();
  }

  function copyLink() {
    const el = linkRef.current;
    if (!el) return;
    el.select();
    el.setSelectionRange(0, 99999);
    navigator.clipboard?.writeText(el.value);
  }

  const generated = state?.ok ? state : null;

  return (
    <div className="panel">
      <h1>Gerar link temporário</h1>
      <p className="sub">
        Defina por quanto tempo o cliente poderá acessar a loja através do link.
      </p>

      {generated && (
        <div className="result">
          <div className="result-title">
            ✅ Link gerado — expira em {generated.label}
          </div>
          <div className="copy-row">
            <input
              id="genlink"
              ref={linkRef}
              type="text"
              readOnly
              value={generated.url}
            />
            <button type="button" onClick={copyLink}>
              Copiar
            </button>
          </div>
          <div className="hint">Vence em: {generated.expiresAtLabel}</div>
        </div>
      )}

      {state && !state.ok && <div className="error">{state.error}</div>}

      <form method="POST" action={formAction} ref={formRef} id="form">
        <label>Duração rápida</label>
        <div className="presets">
          <button type="button" onClick={() => setMinutes(15)}>
            15 min
          </button>
          <button type="button" onClick={() => setMinutes(30)}>
            30 min
          </button>
          <button type="button" onClick={() => setMinutes(60)}>
            1 hora
          </button>
          <button type="button" onClick={() => setMinutes(180)}>
            3 horas
          </button>
          <button type="button" onClick={() => setMinutes(1440)}>
            24 horas
          </button>
        </div>

        <label htmlFor="minutes">Ou personalize (minutos)</label>
        <div className="custom-row">
          <input
            type="number"
            id="minutes"
            name="minutes"
            ref={minutesRef}
            min={minMinutes}
            max={maxMinutes}
            defaultValue={30}
            required
          />
          <span>
            mín. {minMinutes} · máx. {maxMinutes} min
          </span>
        </div>

        <button className="submit" type="submit" disabled={pending}>
          {pending ? "Gerando..." : "Gerar link"}
        </button>
      </form>

      <div className="foot">
        Cada link é único e expira automaticamente. Recarregar é permitido
        enquanto o tempo não acabar.
      </div>
    </div>
  );
}
