"use client";

import { useState } from "react";
import { useChannels } from "@/lib/useChannels";
import { PageHeader, Card, Badge } from "@/components/ui";

export default function ChannelsPage() {
  const { channels, loaded, add, remove, update } = useChannels();
  const [input, setInput] = useState("");
  const [label, setLabel] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    add(input, label || undefined);
    setInput("");
    setLabel("");
  };

  return (
    <div className="space-y-7">
      <PageHeader
        kicker="Stream Roster"
        title="CHANNELS"
        sub="Add the YouTuber channels to watch. Paste a @handle, a channel URL, or a UC… ID. Assign where each one's clips should publish."
      />

      <Card>
        <h2 className="font-display text-xl tracking-wide text-ink">ADD A CHANNEL</h2>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="@MrBeast  ·  youtube.com/@…  ·  UCX6OQ3DkcsbYNE6H8uQQuVA"
            className="flex-1 rounded-xl border border-white/10 bg-void/60 px-4 py-3 text-sm outline-none placeholder:text-[var(--color-muted)]/60 focus:border-neon-pink"
          />
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nickname (optional)"
            className="rounded-xl border border-white/10 bg-void/60 px-4 py-3 text-sm outline-none placeholder:text-[var(--color-muted)]/60 focus:border-neon-cyan sm:w-48"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple px-6 py-3 text-sm font-bold text-void neon-pink transition hover:brightness-110"
          >
            + Add
          </button>
        </form>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          Stored locally on this device for now (temporary MVP). Switches to your Supabase account when auth is wired.
        </p>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl tracking-wide text-ink">
            ROSTER <span className="text-neon-pink">{loaded ? channels.length : ""}</span>
          </h2>
        </div>

        {loaded && channels.length === 0 && (
          <Card className="text-center text-sm text-[var(--color-muted)]">
            No channels yet. Add one above to start building your roster.
          </Card>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {channels.map((c) => (
            <Card key={c.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-lg tracking-wide text-ink">{c.label}</p>
                  <p className="truncate font-mono text-xs text-[var(--color-muted)]">{c.input}</p>
                </div>
                <Badge tone="off">idle</Badge>
              </div>
              <input
                defaultValue={c.destChannel ?? ""}
                onBlur={(e) => update(c.id, { destChannel: e.target.value })}
                placeholder="Publish clips to → (your channel)"
                className="rounded-lg border border-white/10 bg-void/60 px-3 py-2 text-xs outline-none placeholder:text-[var(--color-muted)]/60 focus:border-neon-cyan"
              />
              <div className="flex items-center justify-between">
                <a
                  href={c.input.startsWith("http") ? c.input : `https://youtube.com/${c.input}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-neon-cyan hover:underline"
                >
                  Open on YouTube ↗
                </a>
                <button
                  onClick={() => remove(c.id)}
                  className="text-xs font-semibold text-[var(--color-muted)] transition hover:text-neon-pink"
                >
                  Remove
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
