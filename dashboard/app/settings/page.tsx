"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card } from "@/components/ui";

type Settings = {
  publishMode: "approve_first" | "auto";
  maxPerDay: number;
  privacy: "private" | "unlisted" | "public";
  autoClip: boolean;
  autoPublish: boolean;
  hashtags: string;
};

const DEFAULTS: Settings = {
  publishMode: "approve_first",
  maxPerDay: 6,
  privacy: "private",
  autoClip: true,
  autoPublish: false,
  hashtags: "#shorts #live",
};
const KEY = "clippilot.settings.v1";

export default function SettingsPage() {
  const [s, setS] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    const next = { ...s, [k]: v };
    setS(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  return (
    <div className="space-y-7">
      <PageHeader
        kicker="Mission Control"
        title="SETTINGS"
        sub="Your publishing rules and kill-switches. These sync to the worker once Supabase is connected."
      />

      <Card className="space-y-5">
        <h2 className="font-display text-xl tracking-wide text-ink">PUBLISHING</h2>

        <Row label="Publish mode" hint="Approve-first = you tap every clip. Auto = publishes approved AI picks unattended.">
          <Segmented
            value={s.publishMode}
            onChange={(v) => set("publishMode", v as Settings["publishMode"])}
            options={[
              { value: "approve_first", label: "Approve-first" },
              { value: "auto", label: "Auto" },
            ]}
          />
        </Row>

        <Row label="Default privacy" hint="Stays 'private' until Google verifies the app for public upload.">
          <Segmented
            value={s.privacy}
            onChange={(v) => set("privacy", v as Settings["privacy"])}
            options={[
              { value: "private", label: "Private" },
              { value: "unlisted", label: "Unlisted" },
              { value: "public", label: "Public" },
            ]}
          />
        </Row>

        <Row label="Max uploads / day" hint="YouTube quota ≈ 6 uploads/day by default.">
          <input
            type="number"
            min={1}
            max={50}
            value={s.maxPerDay}
            onChange={(e) => set("maxPerDay", Number(e.target.value))}
            className="w-24 rounded-xl border border-white/10 bg-void/60 px-3 py-2 text-sm outline-none focus:border-neon-cyan"
          />
        </Row>

        <Row label="Default hashtags">
          <input
            value={s.hashtags}
            onChange={(e) => set("hashtags", e.target.value)}
            className="w-full max-w-xs rounded-xl border border-white/10 bg-void/60 px-3 py-2 text-sm outline-none focus:border-neon-cyan"
          />
        </Row>
      </Card>

      <Card className="space-y-5">
        <h2 className="font-display text-xl tracking-wide text-ink">AUTOMATION</h2>
        <Row label="Auto clip generation" hint="Let the worker cut clips automatically when it detects moments.">
          <Toggle on={s.autoClip} onChange={(v) => set("autoClip", v)} />
        </Row>
        <Row label="Auto publishing" hint="Publish approved clips without a final tap. Advised off until you trust the picks.">
          <Toggle on={s.autoPublish} onChange={(v) => set("autoPublish", v)} />
        </Row>
      </Card>

      <Card className="border-neon-pink/40">
        <h2 className="font-display text-xl tracking-wide text-neon-pink glow-pink">EMERGENCY STOP</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Halts all monitoring, clipping, and publishing on the worker. (Wires to the worker in M2.)
        </p>
        <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-neon-pink to-sunset py-3 text-sm font-black uppercase tracking-widest text-void neon-pink">
          ⛔ Stop everything
        </button>
      </Card>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-white/5 pt-4 first:border-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-ink">{label}</p>
        {hint && <p className="text-xs text-[var(--color-muted)]">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-void/60 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
            value === o.value ? "bg-gradient-to-r from-neon-pink to-neon-purple text-void" : "text-[var(--color-muted)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-7 w-13 rounded-full border px-0.5 transition ${on ? "border-neon-cyan bg-neon-cyan/20" : "border-white/15 bg-white/5"}`}
      style={{ width: 52 }}
    >
      <span className={`block h-6 w-6 rounded-full transition ${on ? "translate-x-6 bg-neon-cyan neon-cyan" : "translate-x-0 bg-white/40"}`} />
    </button>
  );
}
