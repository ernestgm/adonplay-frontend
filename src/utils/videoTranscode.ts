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
  videoProfile?: "baseline" | "main" | "high";
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
    const profile = opts.videoProfile || "high"; // "high" es soportado por casi cualquier TV Box desde 2015
    const crf = typeof opts.crf === "number" ? String(opts.crf) : "23";
    const preset = opts.preset || "veryfast";
    const audioBitrate = opts.audioBitrate || "128k";

    const ffmpeg = await getFFmpeg(onLog, (ratio) => {
        if (onProgress) onProgress(Math.round(ratio * 100));
    });

    const inputName = "input.mp4";
    const outputName = "output.mp4";

    try {
        await ffmpeg.writeFile(inputName, await fetchFile(file));

        await ffmpeg.exec([
            "-i", inputName,
            "-c:v", "libx264",
            "-profile:v", profile, // "main" es más compatible que "high"
            "-level", "3.1",      // Bajamos de 4.1 a 3.1 para máxima compatibilidad
            "-pix_fmt", "yuv420p",
            "-preset", preset,
            "-crf", crf,
            "-bf", "0",           // DESACTIVA B-frames (evita el error de reinitialization)
            "-refs", "1",         // Limita cuadros de referencia
            "-vf", "scale=-2:720,fps=30",
            "-g", "60",
            "-keyint_min", "60",
            "-sc_threshold", "0",
            "-c:a", "aac",
            "-b:a", audioBitrate,
            "-ac", "2",
            "-movflags", "+faststart",
            outputName,
        ]);

        const data = await ffmpeg.readFile(outputName);

        // Limpieza de memoria
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);

        const blob = new Blob([new Uint8Array(data as any)], { type: "video/mp4" });
        const baseName = file.name.replace(/\.[^.]+$/, "");
        return new File([blob], `${baseName}-android-tv.mp4`, { type: "video/mp4" });

    } catch (error: any) {
        onLog?.(`Error de compatibilidad: ${error.message}`);
        throw error;
    }
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
