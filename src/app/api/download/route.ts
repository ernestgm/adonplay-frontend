import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_BASE = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL || "/";

// Keep in sync with the remote patterns in next.config.ts. Legacy media was
// stored in Firebase before uploads moved to the Rails API.
const EXTRA_ALLOWED_HOSTS = new Set([
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
  "adonplay-web.firebasestorage.app",
]);

function withTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

function parseBase(value: string): URL | null {
  try {
    const base = new URL(withTrailingSlash(value), "http://localhost");
    return /^https?:$/.test(base.protocol) ? base : null;
  } catch {
    return null;
  }
}

function resolveTarget(raw: string): URL | null {
  if (!raw) return null;

  const uploadBase = parseBase(UPLOAD_BASE);
  if (!uploadBase) return null;

  if (/^https?:\/\//i.test(raw)) {
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      return null;
    }

    // Some records store the public URL with a localhost origin (for example
    // demo files). Rewrite those to the configured upload host so downloads
    // work both from other devices and from inside the Docker network.
    const isLocalUpload =
      ["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname) &&
      parsed.pathname.startsWith("/uploads/");

    // Files are always served from the configured uploads path. Records may
    // keep an old host (localhost, a previous LAN IP or the Docker service
    // name), so rebuild the target against the current upload host instead of
    // rejecting the download.
    const isUploadsPath = parsed.pathname.startsWith("/uploads/");

    if (isLocalUpload || isUploadsPath) {
      const relative = parsed.pathname.replace(/^\/uploads\//, "");
      const target = new URL(relative, uploadBase);
      target.search = parsed.search;
      return target;
    }

    // Only files under the configured uploads path may go through the proxy.
    if (parsed.origin === uploadBase.origin) {
      const prefix = uploadBase.pathname.endsWith("/")
        ? uploadBase.pathname
        : `${uploadBase.pathname}/`;
      return parsed.pathname.startsWith(prefix) ? parsed : null;
    }

    // Legacy Firebase Storage objects.
    if (parsed.protocol === "https:" && EXTRA_ALLOWED_HOSTS.has(parsed.hostname)) {
      return parsed;
    }

    return null;
  }

  if (raw.startsWith("//") || raw.includes("\\")) return null;

  const relative = raw.replace(/^\/+/, "").replace(/^uploads\//, "");
  return new URL(relative, uploadBase);
}

function downloadFileName(requested: string | null, target: URL): string {
  let fallback = "download";
  try {
    fallback = decodeURIComponent(target.pathname.split("/").filter(Boolean).pop() || "download");
  } catch {
    // Keep the generic fallback for malformed percent-encoding.
  }

  const candidate = (requested || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/["\\]/g, "")
    .trim();

  return candidate || fallback;
}

export async function GET(request: NextRequest) {
  const target = resolveTarget(request.nextUrl.searchParams.get("url") || "");
  if (!target) {
    return NextResponse.json({ error: "Invalid download URL." }, { status: 400 });
  }

  try {
    const upstream = await fetch(target, {
      headers: { Accept: "*/*" },
      cache: "no-store",
      redirect: "follow",
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: `Could not download file (${upstream.status}).` },
        { status: 502 }
      );
    }

    const name = downloadFileName(request.nextUrl.searchParams.get("name"), target);
    const asciiName = name.replace(/[^\x20-\x7E]/g, "_");
    const headers = new Headers({
      "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    });

    const length = upstream.headers.get("content-length");
    if (length) headers.set("Content-Length", length);

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Could not download file." }, { status: 502 });
  }
}
