"use client";

import { useState } from "react";
import { useChannels } from "@/lib/useChannels";
import { PageHeader, Card, Badge, Notice } from "@/components/ui";

type LiveResult = {
  input: string;
  channelTitle: string | null;
  live: boolean;
  videoId?: string;
  videoTitle?: string;
  thumbnail?: string;
  error?: string;
};

export default function LivePage() {
  const { channels } = useChannels();
  const [results, setResults] = useState<LiveResult[] | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  const check = async () => {
    if (channels.length === 0) return;
    setLoading(true);
    setNeedsKey(false);
    try {
      const res = await fetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channels: channels.map((c) => c.input) }),
      });
      const data = await res.json();
      if (data.needsKey) {
        setNeedsKey(true);
        setResults(null);
      } else {
        setResults(data.results ?? []);
        setCheckedAt(data.checkedAt ?? null);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const liveOnes = results?.filter((r) => r.live) ?? [];

  return (
    <div className="space-y-7">
      <PageHeader
        kicker="Real-time Radar"
        title="WHO'S LIVE"
        sub="Scan your roster and see who is streaming right now. Live channels are the ones ready to be clipped."
      />

      <Card className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-xl tracking-wide text-ink">{channels.length} channels on roster</p>
          <p className="text-sm text-[var(--color-muted)]">
            {checkedAt ? `Last scan: ${new Date(checkedAt).toLocaleTimeString()}` : "Not scanned yet"}
          </p>
        </div>
        <button
          onClick={check}
          disabled={loading || channels.length === 0}
          className="rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple px-6 py-3 text-sm font-bold text-void neon-pink transition hover:brightness-110 disabled:opacity-40"
        >
          {loading ? "Scanning…" : "🔴 Scan now"}
        </button>
      </Card>

      {needsKey && (
        <Notice title="Live detection needs a YouTube API key">
          Add <span className="font-mono text-neon-cyan">YOUTUBE_API_KEY</span> in your Vercel project env (free — YouTube
          Data API v3). Then scan again. See <span className="font-mono">SETUP.md</span> step 2.
        </Notice>
      )}

      {channels.length === 0 && (
        <Card className="text-center text-sm text-[var(--color-muted)]">
          Add channels first, then scan.
        </Card>
      )}

      {results && (
        <>
          {liveOnes.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-xl tracking-wide text-neon-pink glow-pink">● LIVE NOW · {liveOnes.length}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {liveOnes.map((r) => (
                  <Card key={r.input} className="flex gap-3">
                    {r.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.thumbnail} alt="" className="h-20 w-32 shrink-0 rounded-lg object-cover neon-pink" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge tone="live">live</Badge>
                      </div>
                      <p className="mt-1 truncate font-semibold text-ink">{r.channelTitle ?? r.input}</p>
                      <p className="line-clamp-2 text-xs text-[var(--color-muted)]">{r.videoTitle}</p>
                      <a
                        href={`https://youtube.com/watch?v=${r.videoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-neon-cyan hover:underline"
                      >
                        Watch ↗
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-2">
            <h2 className="font-display text-lg tracking-wide text-[var(--color-muted)]">FULL SCAN</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {results.map((r) => (
                <div key={r.input} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-sm">
                  <span className="truncate text-ink">{r.channelTitle ?? r.input}</span>
                  {r.error ? <Badge tone="warn">error</Badge> : r.live ? <Badge tone="live">live</Badge> : <Badge tone="off">offline</Badge>}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
