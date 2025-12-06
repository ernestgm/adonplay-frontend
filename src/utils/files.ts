const FILE_BASE_URL = process.env.NEXT_PUBLIC_NEXT_PUBLIC || "/";

export default function mediaUrl(file_path: string) {
    return FILE_BASE_URL + file_path
}