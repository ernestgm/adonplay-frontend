"use client";

import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import MenuCanvas from "@/components/app/menus/MenuCanvas";
import {
  MenuConfig,
  MenuItem,
  MenuOrientation,
  STAGE_SIZES,
  mergeMenuConfig,
  normalizeMenuItems,
} from "@/components/app/menus/menuTypes";
import { captureMenuImage } from "@/utils/menuSnapshot";
import mediaUrl from "@/utils/files";
import { fetchMedia, updateMedia } from "@/server/api/media";
import { getSlide } from "@/server/api/slides";
import { uploadFileToStorage } from "@/utils/firebaseStorage";

export interface MenuSnapshotRefreshResult {
  updated: number;
  failed: number;
}

function snapshotPrefix(menuId: number | string) {
  return `menu-${menuId}-`;
}

function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  return Promise.all(
    images.map((image) => {
      // `complete` puede ser true antes de que el navegador empiece a cargar.
      // Solo se considera lista cuando ya tiene dimensiones reales.
      if (image.complete && image.naturalWidth > 0) return Promise.resolve();

      return new Promise<void>((resolve) => {
        const done = () => resolve();
        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", done, { once: true });
        // Nunca bloquear la regeneración por una imagen que no responde.
        setTimeout(done, 5000);
      });
    }),
  ).then(() => undefined);
}

/**
 * Carga una imagen remota y la convierte a data URL. Así html2canvas no
 * depende de que el navegador tenga la imagen en caché o de una petición
 * CORS adicional al momento de capturar.
 */
function loadImageAsDataUrl(src: string): Promise<string> {
  return new Promise((resolve) => {
    // El Service Worker cachea imágenes sin cabeceras CORS. Se usa una URL
    // única para forzar una respuesta de red con CORS y así poder incrustar
    // el fondo en la captura.
    const separator = src.includes("?") ? "&" : "?";
    const url = `${src}${separator}snapshot=cors`;

    fetch(url, { mode: "cors", cache: "reload" })
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo descargar el fondo");
        return response.blob();
      })
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || src));
        reader.onerror = () => resolve(src);
        reader.readAsDataURL(blob);
      })
      .catch(() => resolve(src));
  });
}

function detectOrientation(filePath: string): Promise<MenuOrientation | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(
        image.naturalHeight > image.naturalWidth ? "portrait" : "landscape",
      );
    };
    image.onerror = () => resolve(null);
    image.src = mediaUrl(filePath);
  });
}

/**
 * Regenera las imágenes "menu-<id>-..." que se insertaron en slides y
 * reemplaza el archivo de cada media. Así un TV que reproduce el formmenu como
 * imagen recibe los precios nuevos sin tener que volver a asignarlo.
 *
 * No falla el guardado del formmenu si una imagen no se puede regenerar: devuelve
 * cuántas se actualizaron y cuántas fallaron.
 */
export async function refreshMenuSnapshots(
  menuId: number | string,
): Promise<MenuSnapshotRefreshResult> {
  if (typeof document === "undefined") {
    return { updated: 0, failed: 0 };
  }

  const [mediaList, slide] = await Promise.all([fetchMedia(), getSlide(menuId)]);
  const media = Array.isArray(mediaList) ? mediaList : [];
  const numericMenuId = Number(menuId);
  const snapshots = media.filter(
    (item: any) =>
      // Vínculo explícito (media creada después de este cambio).
      Number(item?.menu_slide_id) === numericMenuId ||
      // Compatibilidad con imágenes antiguas que solo llevan el ID en el nombre.
      String(item?.file_path || "").includes(snapshotPrefix(menuId)),
  );

  if (snapshots.length === 0) {
    return { updated: 0, failed: 0 };
  }

  const config: MenuConfig = mergeMenuConfig(slide?.menu?.config);
  const items: MenuItem[] = normalizeMenuItems(slide?.menu?.items);
  const currency = slide?.business?.currency || "MXN";

  let updated = 0;
  let failed = 0;

  for (const snapshot of snapshots) {
    let host: HTMLDivElement | null = null;
    let root: Root | null = null;

    try {
      const orientation = await detectOrientation(String(snapshot.file_path || ""));
      if (!orientation) {
        failed += 1;
        continue;
      }

      const stage = STAGE_SIZES[orientation];
      host = document.createElement("div");
      host.setAttribute("data-menu-snapshot-refresh", "true");
      host.style.cssText = [
        "position:fixed",
        "left:-30000px",
        "top:0",
        `width:${stage.width}px`,
        `height:${stage.height}px`,
        "pointer-events:none",
        "z-index:-1",
      ].join(";");
      document.body.appendChild(host);

      root = createRoot(host);
      const backgroundPath = config[orientation]?.background?.file_path;
      const backgroundRemoteUrl = backgroundPath ? mediaUrl(backgroundPath) : "";
      // Se precarga como data URL para que la captura incluya el fondo aunque
      // el navegador no lo haya cacheado todavía.
      const backgroundUrl = backgroundRemoteUrl
        ? await loadImageAsDataUrl(backgroundRemoteUrl)
        : undefined;

      flushSync(() => {
        root?.render(
          <MenuCanvas
            config={config}
            items={items}
            orientation={orientation}
            backgroundUrl={backgroundUrl}
            currency={currency}
            snapshot
            className="h-full w-full"
          />,
        );
      });

      await waitForImages(host);
      const blob = await captureMenuImage(host);
      const file = new File(
        [blob],
        `menu-${menuId}-${Date.now()}-${orientation}.jpg`,
        { type: "image/jpeg" },
      );
      const uploaded = await uploadFileToStorage(file, "media/image");
      await updateMedia(snapshot.id, { file_path: uploaded.downloadURL });
      updated += 1;
    } catch (error) {
      console.error("No se pudo actualizar la imagen del formmenu en el slide", error);
      failed += 1;
    } finally {
      if (root) {
        try {
          root.unmount();
        } catch {
          // El contenedor pudo haberse desmontado ya; no es un error fatal.
        }
      }
      host?.remove();
    }
  }

  return { updated, failed };
}
