"use client";

import { useState } from "react";
import { PageHeader, Card } from "@/components/ui";

const TASKS = [
  {
    title: "Build my live-streamer roster",
    why: "Get a ready-to-paste list of channels (with their UC… IDs) you're allowed to clip, so the Channels page fills in seconds.",
    prompt: `You are my research assistant for a YouTube live-clipping project. I can only clip channels I OWN or am AUTHORIZED to clip.

Here are the creators/channels I have rights to: [LIST THEM — your own channels, or creators who gave permission].

For each one, return a markdown table with columns:
| Nickname | @handle | Channel URL | Channel ID (UC...) | Typical live schedule |

Only include channels you are confident about. If you can't find the UC… ID, say "unknown" rather than guessing. Do not invent channels I didn't list.`,
  },
  {
    title: "Write my Google OAuth verification justification",
    why: "Google's app audit (needed for PUBLIC auto-publishing) requires a written justification for the youtube.upload scope. This drafts it.",
    prompt: `Write a concise, honest justification for a Google OAuth app verification request.

App: "ClipPilot" — a personal tool that turns MY authorized YouTube live streams into short vertical clips and uploads them to MY OWN YouTube channels after I approve each one from my phone.

Scope requested: https://www.googleapis.com/auth/youtube.upload
Explain: what the app does, why the upload scope is required, that it only uploads to the authenticated user's own channels, that each upload is user-approved, and how tokens are stored securely server-side. Keep it under 200 words, plain and truthful.`,
  },
  {
    title: "Generate viral title + hashtag templates",
    why: "Seed the metadata generator with high-performing title patterns for your niche, so clips get better titles from day one.",
    prompt: `I run a YouTube Shorts channel in the [NICHE, e.g. gaming/reactions/debates] space, clipping live-stream moments.

Give me 25 reusable Shorts TITLE TEMPLATES that are punchy, curiosity-driven, and NOT clickbait-lies (they must be fillable from what actually happens in a clip). Use placeholders like {streamer}, {reaction}, {thing}.

Then give me 6 hashtag sets (4–6 tags each) tuned for that niche. Output as plain text I can paste into a config file.`,
  },
  {
    title: "Draft the Telegram approval message format",
    why: "Design the push message you'll get on your phone for each clip, so approving on the go is one glance + one tap.",
    prompt: `Design the text layout for a Telegram notification that alerts me a new AI clip is ready to approve.

It should fit a phone lock screen, show: clip title, viral score, source channel, duration, and two inline-button labels (Approve / Reject). Give me 3 layout variations (compact, standard, detailed) as literal text mockups.`,
  },
];

export default function ChatGPTPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        kicker="Offload Desk"
        title="AI TASKS"
        sub="Work you can hand to ChatGPT in parallel. Tap copy, paste into ChatGPT, fill the [BRACKETS], bring the result back."
      />
      <div className="grid gap-4">
        {TASKS.map((t) => (
          <TaskCard key={t.title} {...t} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ title, why, prompt }: { title: string; why: string; prompt: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-wide text-ink">{title}</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{why}</p>
        </div>
        <button
          onClick={copy}
          className="shrink-0 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-2 text-xs font-bold text-void neon-cyan transition hover:brightness-110"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-void/70 p-4 font-mono text-xs leading-relaxed text-[var(--color-muted)]">
        {prompt}
      </pre>
    </Card>
  );
}
