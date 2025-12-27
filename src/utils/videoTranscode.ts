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
            "-profile:v", profile,
            // Nivel 4.1 es el límite para la mayoría de hardware Android TV antiguo (1080p)
            "-level", "4.1",
            "-pix_fmt", "yuv420p",
            "-preset", preset,
            "-crf", crf,
            // Filtros: Asegura dimensiones pares y fuerza 30fps para estabilidad en TV
            "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30",
            // GOP: Crea un punto de acceso cada 60 frames (2 segundos a 30fps)
            // Esto evita que la TV Box se "trabe" al intentar navegar el video.
            "-g", "60",
            "-keyint_min", "60",
            "-sc_threshold", "0",
            // Audio: Forzamos AAC estéreo (2 canales) para evitar problemas con codecs multicanal
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
