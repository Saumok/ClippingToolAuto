import { NextResponse } from "next/server";

/**
 * POST /api/live  { channels: string[] }
 * Checks which of the given YouTube channels are live RIGHT NOW using the
 * YouTube Data API v3. Accepts channel IDs (UC...), @handles, or channel URLs.
 *
 * Needs env YOUTUBE_API_KEY (server-only). Without it, returns { needsKey: true }
 * and a clear message — no fake data.
 *
 * Quota note: each live check is a search.list call = 100 units. Default daily
 * quota is 10,000 units, so ~100 manual checks/day. The always-on worker does
 * cheaper continuous polling later; this route is for on-demand checks from the UI.
 */
type LiveResult = {
  input: string;
  channelId: string | null;
  channelTitle: string | null;
  live: boolean;
  videoId?: string;
  videoTitle?: string;
  thumbnail?: string;
  error?: string;
};

const API = "https://www.googleapis.com/youtube/v3";

function parseInput(raw: string): { type: "id" | "handle"; value: string } {
  const s = raw.trim();
  const chan = s.match(/youtube\.com\/channel\/(UC[\w-]{22})/i);
  if (chan) return { type: "id", value: chan[1] };
  if (/^UC[\w-]{22}$/.test(s)) return { type: "id", value: s };
  const handle = s.match(/@([A-Za-z0-9._-]+)/);
  if (handle) return { type: "handle", value: "@" + handle[1] };
  return { type: "handle", value: s.startsWith("@") ? s : "@" + s };
}

async function resolveChannel(key: string, input: string) {
  const p = parseInput(input);
  if (p.type === "id") {
    const r = await fetch(`${API}/channels?part=snippet&id=${p.value}&key=${key}`);
    const j = await r.json();
    const item = j.items?.[0];
    return item ? { channelId: p.value, channelTitle: item.snippet?.title ?? null } : { channelId: p.value, channelTitle: null };
  }
  // handle → channel
  const r = await fetch(`${API}/channels?part=snippet&forHandle=${encodeURIComponent(p.value)}&key=${key}`);
  const j = await r.json();
  const item = j.items?.[0];
  if (item) return { channelId: item.id as string, channelTitle: item.snippet?.title ?? null };
  return { channelId: null, channelTitle: null };
}

async function checkLive(key: string, channelId: string) {
  const r = await fetch(
    `${API}/search?part=snippet&channelId=${channelId}&eventType=live&type=video&maxResults=1&key=${key}`
  );
  const j = await r.json();
  if (j.error) throw new Error(j.error?.message ?? "YouTube API error");
  const item = j.items?.[0];
  if (!item) return { live: false as const };
  return {
    live: true as const,
    videoId: item.id?.videoId as string,
    videoTitle: item.snippet?.title as string,
    thumbnail: item.snippet?.thumbnails?.medium?.url as string,
  };
}

export async function POST(req: Request) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return NextResponse.json({
      needsKey: true,
      message: "Set YOUTUBE_API_KEY in Vercel env to enable live detection (free; YouTube Data API v3).",
    });
  }

  let channels: string[] = [];
  try {
    const body = await req.json();
    channels = Array.isArray(body.channels) ? body.channels.filter(Boolean) : [];
  } catch {
    return NextResponse.json({ error: "Body must be { channels: string[] }" }, { status: 400 });
  }
  if (channels.length === 0) return NextResponse.json({ results: [] });

  const results: LiveResult[] = await Promise.all(
    channels.map(async (input): Promise<LiveResult> => {
      try {
        const { channelId, channelTitle } = await resolveChannel(key, input);
        if (!channelId) return { input, channelId: null, channelTitle: null, live: false, error: "Channel not found" };
        const live = await checkLive(key, channelId);
        return { input, channelId, channelTitle, ...live };
      } catch (e) {
        return { input, channelId: null, channelTitle: null, live: false, error: (e as Error).message };
      }
    })
  );

  return NextResponse.json({ results, checkedAt: new Date().toISOString() });
}
