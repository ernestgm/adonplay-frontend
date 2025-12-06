const FILE_BASE_URL = process.env.UPLOAD_BASE_URL || "/";

export default function mediaUrl(file_path: string) {
    return FILE_BASE_URL + file_path
}