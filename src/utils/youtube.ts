export type YoutubeSourceType = "video" | "playlist";

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

export interface ParsedYoutubeUrl {
  sourceType: YoutubeSourceType;
  youtubeId: string;
}

export interface YoutubeEmbedOptions {
  loop?: boolean;
  audio?: boolean;
  captions?: boolean;
}

export function parseYoutubeUrl(value?: string | null): ParsedYoutubeUrl | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (!YOUTUBE_HOSTS.has(host) || !["http:", "https:"].includes(url.protocol)) return null;

    const playlistId = url.searchParams.get("list");
    if (playlistId && /^[A-Za-z0-9_-]{6,}$/.test(playlistId)) {
      return {sourceType: "playlist", youtubeId: playlistId};
    }

    const videoId = host.endsWith("youtu.be")
      ? url.pathname.split("/").filter(Boolean)[0]
      : url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];

    return videoId && /^[A-Za-z0-9_-]{6,}$/.test(videoId)
      ? {sourceType: "video", youtubeId: videoId}
      : null;
  } catch {
    return null;
  }
}

export function youtubeEmbedUrl(
  source: ParsedYoutubeUrl | {source_type?: YoutubeSourceType; youtube_id?: string} | null,
  options: YoutubeEmbedOptions = {},
) {
  if (!source) return "";
  const type = "sourceType" in source ? source.sourceType : source.source_type;
  const youtubeId = "youtubeId" in source ? source.youtubeId : source.youtube_id;
  if (!youtubeId) return "";
  const params = new URLSearchParams({
    autoplay: "1",
    mute: options.audio ? "0" : "1",
    playsinline: "1",
    rel: "0",
    controls: "1",
    cc_load_policy: options.captions ? "1" : "0",
    enablejsapi: "1",
  });
  if (typeof window !== "undefined") params.set("origin", window.location.origin);

  if (options.loop) {
    params.set("loop", "1");
    if (type !== "playlist") params.set("playlist", youtubeId);
  }

  return type === "playlist"
    ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(youtubeId)}&${params.toString()}`
    : `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?${params.toString()}`;
}
