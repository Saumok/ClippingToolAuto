"use client";

import { useEffect, useState } from "react";

/**
 * TEMPORARY MVP STORAGE. Channels live in localStorage so the dashboard is fully
 * usable the moment it deploys, with zero backend config. When Supabase auth is
 * wired (M2), this hook swaps to the `streams` table — the component API stays the same.
 */
export type Channel = {
  id: string;
  input: string; // what the user typed (@handle / URL / UC id)
  label: string;
  destChannel?: string; // which of YOUR channels clips publish to
  addedAt: number;
};

const KEY = "clippilot.channels.v1";

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setChannels(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  const persist = (next: Channel[]) => {
    setChannels(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const add = (input: string, label?: string, destChannel?: string) => {
    const clean = input.trim();
    if (!clean) return;
    if (channels.some((c) => c.input.toLowerCase() === clean.toLowerCase())) return;
    persist([
      ...channels,
      { id: crypto.randomUUID(), input: clean, label: label?.trim() || clean, destChannel, addedAt: Date.now() },
    ]);
  };

  const remove = (id: string) => persist(channels.filter((c) => c.id !== id));
  const update = (id: string, patch: Partial<Channel>) =>
    persist(channels.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return { channels, loaded, add, remove, update };
}
