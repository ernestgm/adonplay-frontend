import { apiPost } from "@/server/api/apiClient";

export interface UploadedRef {
  downloadURL: string;
  storagePath: string;
}

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

// Compatibility API kept for existing forms. Files are uploaded to the local
// Rails API and stored under rorbackend/public/uploads.
async function uploadLocal(file: File, pathPrefix: string, onProgress?: (percent: number) => void): Promise<UploadedRef> {
  const form = new FormData();
  form.append("file", file, sanitizeFileName(file.name));
  form.append("media_type", pathPrefix.split("/").pop() || "file");
  const result = await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/media/upload`, form);
  onProgress?.(100);
  return { storagePath: result.file_path, downloadURL: result.file_path };
}

export const uploadFileToStorage = (file: File, pathPrefix = "uploads") => uploadLocal(file, pathPrefix);
export const uploadFileToStorageWithProgress = (file: File, pathPrefix = "uploads", onProgress?: (percent: number) => void) => uploadLocal(file, pathPrefix, onProgress);
export const uploadFileToExactPath = (file: File, storagePath: string) => uploadLocal(file, storagePath);

export function getStoragePathFromDownloadURL(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    if (!/^https?:\/\//i.test(url)) return url.replace(/^\//, "");
    const parsed = new URL(url);
    const marker = "/uploads/";
    const index = parsed.pathname.indexOf(marker);
    return index >= 0 ? parsed.pathname.slice(index + marker.length) : null;
  } catch {
    return null;
  }
}

// Local files are removed by the Rails lifecycle; kept as a no-op for callers
// that previously deleted cloud objects directly from the browser.
export async function deleteFileByDownloadURL(_url: string): Promise<void> {}

export function getFileNameFromURL(url: string | null | undefined): string | null {
  const path = getStoragePathFromDownloadURL(url);
  return path ? path.split("/").pop() || null : null;
}
