import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";

export interface UploadedRef {
  downloadURL: string;
  storagePath: string;
}

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

export async function uploadFileToStorage(file: File, pathPrefix: string = "uploads"): Promise<UploadedRef> {
  const timestamp = Date.now();
  const cleanName = sanitizeFileName(file.name);
  const storagePath = `${pathPrefix}/${timestamp}-${cleanName}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const downloadURL = await getDownloadURL(storageRef);
  return { downloadURL, storagePath };
}

// Extract the object path from a Firebase Storage download URL or gs:// URL
export function getStoragePathFromDownloadURL(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    if (url.startsWith("gs://")) {
      // Format: gs://<bucket>/<path>
      const withoutScheme = url.replace(/^gs:\/\//, "");
      const firstSlash = withoutScheme.indexOf("/");
      if (firstSlash === -1) return null;
      return withoutScheme.substring(firstSlash + 1);
    }
    const u = new URL(url);
    // Expected: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<pathEncoded>?...
    const parts = u.pathname.split("/");
    const oIndex = parts.findIndex((p) => p === "o");
    if (oIndex !== -1 && parts.length > oIndex + 1) {
      const encodedPath = parts[oIndex + 1];
      return decodeURIComponent(encodedPath);
    }
  } catch (_) {
    // Ignore parse errors
  }
  return null;
}

export async function uploadFileToExactPath(file: File, storagePath: string): Promise<UploadedRef> {
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const downloadURL = await getDownloadURL(storageRef);
  return { downloadURL, storagePath };
}

export async function deleteFileByDownloadURL(url: string): Promise<void> {
  const path = getStoragePathFromDownloadURL(url);
  if (!path) return; // Not a Firebase Storage URL we can handle
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
