const FILE_BASE_URL = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL || "/";

function isAbsoluteUrl(path?: string) {
    if (!path) return false;
    return /^https?:\/\//i.test(path) || /^data:/i.test(path);
}

function getUploadBase(): URL | null {
    try {
        return /^https?:\/\//i.test(FILE_BASE_URL) ? new URL(FILE_BASE_URL) : null;
    } catch {
        return null;
    }
}

export default function mediaUrl(file_path: string) {
    if (!file_path) return "";

    if (/^data:/i.test(file_path)) return file_path;

    if (/^https?:\/\//i.test(file_path)) {
        try {
            const parsed = new URL(file_path);
            const base = getUploadBase();

            // Legacy/demo records may store an absolute localhost URL. Replace
            // that origin with the configured upload host so the file is also
            // reachable when the app is opened from another device.
            const isLocalUpload =
                base &&
                ["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname) &&
                parsed.pathname.startsWith("/uploads/");

            if (isLocalUpload) {
                const relative = parsed.pathname.replace(/^\/uploads\//, "");
                return new URL(relative, FILE_BASE_URL).toString();
            }
        } catch {
            return file_path;
        }

        return file_path;
    }

    if (isAbsoluteUrl(file_path)) return file_path;

    return FILE_BASE_URL + file_path.replace(/^\/+/, "");
}
