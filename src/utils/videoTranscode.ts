"use client";

import {FFmpeg} from "@ffmpeg/ffmpeg";
import {fetchFile} from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;

async function getFFmpeg(onLog?: (msg: string) => void, onProgress?: (ratio: number) => void): Promise<FFmpeg> {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
    if (onLog) {
      ffmpegInstance.on("log", ({ message }) => onLog(message));
    }
    if (onProgress) {
      ffmpegInstance.on("progress", ({ progress }) => onProgress(progress));
    }
    await ffmpegInstance.load();
  }
  return ffmpegInstance;
}

export interface TranscodeOptions {
  videoProfile?: "baseline" | "main";
  crf?: number; // quality 18-28 typical
  preset?: "ultrafast" | "superfast" | "veryfast" | "faster" | "fast" | "medium" | "slow" | "slower" | "veryslow";
  audioBitrate?: string; // e.g. "128k"
}

export async function transcodeToH264Compatible(
  file: File,
  opts: TranscodeOptions = {},
  onProgress?: (percent: number) => void,
  onLog?: (msg: string) => void
): Promise<File> {
  const profile = opts.videoProfile || "baseline";
  const crf = typeof opts.crf === "number" ? String(opts.crf) : "23";
  const preset = opts.preset || "veryfast";
  const audioBitrate = opts.audioBitrate || "128k";

  const ffmpeg = await getFFmpeg(onLog, (ratio) => {
    if (onProgress) onProgress(Math.round(ratio * 100));
  });

  const inputName = "input.mp4"; // we only accept mp4 input in UI
  const outputName = "output.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // Ensure even dimensions for H.264, set baseline/main profile, yuv420p for compatibility, and faststart
  await ffmpeg.exec([
    "-i",
    inputName,
    "-c:v",
    "libx264",
    "-profile:v",
    profile,
    "-level",
    profile === "baseline" ? "3.0" : "4.0",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    preset,
    "-crf",
    crf,
    "-vf",
    "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    "-c:a",
    "aac",
    "-b:a",
    audioBitrate,
    "-movflags",
    "+faststart",
    outputName,
  ]);

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data as Uint8Array], { type: "video/mp4" });

  // Create a new File object preserving the base name
  const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}-h264.mp4`, {type: "video/mp4"});
}

export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      const cleanup = () => {
        URL.revokeObjectURL(url);
      };
      video.onloadedmetadata = () => {
        const duration = video.duration || 0;
        cleanup();
        resolve(duration);
      };
      video.onerror = () => {
        cleanup();
        reject(new Error("Could not read the video duration"));
      };
      video.src = url;
    } catch (e) {
      reject(e);
    }
  });
}
