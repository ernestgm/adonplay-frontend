const FILE_BASE_URL = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL || "/";

function isAbsoluteUrl(path?: string) {
    if (!path) return false;
    return /^https?:\/\//i.test(path) || /^data:/i.test(path);
}

export default function mediaUrl(file_path: string) {
    if (!file_path) return "";
    if (isAbsoluteUrl(file_path)) return file_path;
    return FILE_BASE_URL + file_path;
}