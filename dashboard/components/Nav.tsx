"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview", icon: "◎" },
  { href: "/channels", label: "Channels", icon: "📡" },
  { href: "/live", label: "Who's Live", icon: "🔴" },
  { href: "/clips", label: "Clips", icon: "✂️" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/chatgpt", label: "AI Tasks", icon: "🤖" },
];

export function Nav() {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-2 border-r border-white/5 px-5 py-7 lg:flex">
        <Brand />
        <nav className="mt-6 flex flex-col gap-1.5">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                active(l.href)
                  ? "glass neon-pink text-ink"
                  : "text-[var(--color-muted)] hover:bg-white/5 hover:text-ink"
              }`}
            >
              <span className="text-base">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto text-[11px] leading-relaxed text-[var(--color-muted)]/70">
          <p className="font-mono uppercase tracking-widest text-neon-cyan/80">v0.1 · vice city</p>
          <p className="mt-1">Approve-first. Nothing posts without your tap.</p>
        </div>
      </aside>

      {/* Mobile top brand */}
      <header className="flex items-center justify-between px-4 pt-5 lg:hidden">
        <Brand compact />
        <span className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan/80">vice city</span>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
        <div className="glass mx-3 mb-3 flex items-stretch justify-between rounded-2xl px-1.5 py-1.5">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition ${
                active(l.href) ? "text-neon-pink glow-pink" : "text-[var(--color-muted)]"
              }`}
            >
              <span className="text-lg leading-none">{l.icon}</span>
              <span className="truncate">{l.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple text-lg font-black text-void neon-pink">
        VI
      </span>
      <span className={`font-display tracking-wide text-gradient ${compact ? "text-xl" : "text-2xl"}`}>
        CLIPPILOT
      </span>
    </Link>
  );
}
