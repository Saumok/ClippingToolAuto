"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "@/lib/supabase";
import { PageHeader, Card, Badge, Notice } from "@/components/ui";

type Clip = {
  id: string;
  title: string | null;
  viral_score: number | null;
  hashtags: string[] | null;
  status: string;
  video_path: string | null;
  source_url: string | null;
  created_at: string;
};

export default function ClipsPage() {
  const [clips, setClips] = useState<Clip[] | null>(null);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    const sb = browserSupabase();
    if (!sb) {
      setConfigured(false);
      setClips([]);
      return;
    }
    sb.from("clips")
      .select("id,title,viral_score,hashtags,status,video_path,source_url,created_at")
      .in("status", ["pending_review", "approved", "queued_for_upload", "uploading"])
      .order("created_at", { ascending: false })
      .then(({ data }) => setClips((data as Clip[]) ?? []));
  }, []);

  return (
    <div className="space-y-7">
      <PageHeader
        kicker="Approval Desk"
        title="CLIPS"
        sub="Every AI-cut Short lands here for review. Approve to publish, reject to bin. Your tap is the only thing that ships a clip."
      />

      {!configured && (
        <Notice title="Connect Supabase to see live clips">
          Add <span className="font-mono text-neon-cyan">NEXT_PUBLIC_SUPABASE_URL</span> and{" "}
          <span className="font-mono text-neon-cyan">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> in Vercel env. The worker writes
          clips here; this screen shows them for one-tap approval. See <span className="font-mono">SETUP.md</span> step 1.
        </Notice>
      )}

      {clips && clips.length === 0 && configured && (
        <Card className="text-center text-sm text-[var(--color-muted)]">
          No clips awaiting review. When the worker detects a viral moment, its captioned Short appears here.
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {clips?.map((c) => (
          <Card key={c.id} className="flex flex-col gap-3">
            <div className="grid aspect-[9/16] w-full place-items-center overflow-hidden rounded-xl bg-void/80 neon-pink">
              <span className="text-5xl opacity-30">▶</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge tone={c.status === "pending_review" ? "warn" : "ok"}>{c.status.replace(/_/g, " ")}</Badge>
              {c.viral_score != null && (
                <span className="font-display text-lg text-gradient">{Math.round(c.viral_score)}</span>
              )}
            </div>
            <p className="font-semibold leading-snug text-ink">{c.title ?? "Untitled clip"}</p>
            {c.hashtags && <p className="text-xs text-neon-cyan">{c.hashtags.join(" ")}</p>}
            <div className="mt-auto grid grid-cols-2 gap-2">
              <button className="rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple py-2.5 text-sm font-bold text-void neon-cyan">
                ✓ Approve
              </button>
              <button className="rounded-xl border border-neon-pink/40 py-2.5 text-sm font-bold text-neon-pink">
                ✕ Reject
              </button>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-[var(--color-muted)]/70">
        Approve/Reject become live actions once the worker + Supabase are connected (M1).
      </p>
    </div>
  );
}
