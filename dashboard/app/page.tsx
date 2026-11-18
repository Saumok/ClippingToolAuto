import Link from "next/link";
import { PageHeader, StatCard, Card, Badge } from "@/components/ui";

export default function Overview() {
  return (
    <div className="space-y-7">
      <PageHeader
        kicker="Vice City Control Center"
        title="OVERVIEW"
        sub="Your autonomous clipping desk. Monitor streams, review AI-cut Shorts, and approve with one tap — from anywhere."
      />

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Active Streams" value="0" accent="pink" hint="Add channels to begin" />
        <StatCard label="Clips Generated" value="0" accent="cyan" />
        <StatCard label="Pending Approval" value="0" accent="gold" hint="Awaiting your tap" />
        <StatCard label="Published" value="0" accent="pink" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-wide text-ink">SYSTEM STATUS</h2>
            <Badge tone="warn">Setup needed</Badge>
          </div>
          <ul className="mt-4 space-y-2.5 text-sm">
            <StatusRow label="Worker (your PC)" detail="Start the worker, then it reports a heartbeat here." />
            <StatusRow label="Supabase" detail="Add env keys to store clips & approvals." />
            <StatusRow label="YouTube API" detail="Add YOUTUBE_API_KEY to detect live streams." />
            <StatusRow label="Telegram" detail="Connect the bot for phone push + one-tap approve." />
          </ul>
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Walkthrough in <span className="font-mono text-neon-cyan">SETUP.md</span>. Until configured, the UI runs on
            local demo storage — no fake clips are shown.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-2xl tracking-wide text-ink">QUICK ACTIONS</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            <Action href="/channels" icon="📡" label="Add YouTuber channels" />
            <Action href="/live" icon="🔴" label="Find who's live now" />
            <Action href="/clips" icon="✂️" label="Review clips" />
            <Action href="/chatgpt" icon="🤖" label="Offload work to ChatGPT" />
          </div>
        </Card>
      </section>

      <Card className="border-neon-pink/30">
        <h2 className="font-display text-xl tracking-wide text-ink">THE GOLDEN RULE</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Approve-first by default: nothing is ever published without your explicit tap. Clip only streams you own or are
          authorized to clip. Until Google verifies the app, uploads land <span className="text-gold">private</span> for
          you to flip public.
        </p>
      </Card>
    </div>
  );
}

function StatusRow({ label, detail }: { label: string; detail: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-white/15" />
      <span>
        <span className="font-semibold text-ink">{label}</span>
        <span className="text-[var(--color-muted)]"> — {detail}</span>
      </span>
    </li>
  );
}

function Action({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-3 text-sm font-medium transition hover:border-neon-pink/40 hover:bg-white/[0.06]"
    >
      <span className="text-lg">{icon}</span>
      {label}
      <span className="ml-auto text-neon-pink">→</span>
    </Link>
  );
}
