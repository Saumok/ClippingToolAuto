import type { ReactNode } from "react";

export function PageHeader({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      {kicker && (
        <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.25em] text-neon-cyan/80">{kicker}</p>
      )}
      <h1 className="font-display text-4xl leading-none tracking-wide text-gradient sm:text-5xl">{title}</h1>
      {sub && <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">{sub}</p>}
    </div>
  );
}

export function StatCard({ label, value, accent = "pink", hint }: { label: string; value: ReactNode; accent?: "pink" | "cyan" | "gold"; hint?: string }) {
  const glow = accent === "cyan" ? "glow-cyan" : "glow-pink";
  const bar = accent === "cyan" ? "from-neon-cyan to-neon-purple" : accent === "gold" ? "from-gold to-sunset" : "from-neon-pink to-neon-purple";
  return (
    <div className="card p-4 sm:p-5">
      <div className={`mb-3 h-1 w-10 rounded-full bg-gradient-to-r ${bar}`} />
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">{label}</p>
      <p className={`mt-1 font-display text-3xl sm:text-4xl ${glow}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--color-muted)]/80">{hint}</p>}
    </div>
  );
}

export function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "live" | "off" | "muted" | "warn" | "ok" }) {
  const map: Record<string, string> = {
    live: "bg-neon-pink/15 text-neon-pink neon-pink",
    off: "bg-white/5 text-[var(--color-muted)]",
    muted: "bg-white/5 text-[var(--color-muted)]",
    warn: "bg-gold/15 text-gold",
    ok: "bg-neon-cyan/15 text-neon-cyan",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${map[tone]}`}>
      {tone === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-pink" />}
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card border-gold/30 p-5">
      <p className="font-display text-lg text-gold">⚠ {title}</p>
      <div className="mt-1 text-sm text-[var(--color-muted)]">{children}</div>
    </div>
  );
}
