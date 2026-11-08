import html2canvas from "html2canvas";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * html2canvas puede omitir una imagen si su origen no permite leer píxeles
 * (CORS) o si el clon la carga tarde. Para que el fondo salga siempre,
 * descargamos cada imagen y la incrustamos como data URL antes de capturar.
 */
async function inlineImagesForCapture(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(async (image) => {
      const src = image.getAttribute("src") || "";
      if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(src, {
          mode: "cors",
          credentials: "omit",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        image.setAttribute("src", dataUrl);
        image.removeAttribute("crossorigin");
        await image.decode().catch(() => undefined);
      } catch {
        // Si no se puede leer (por CORS o red), dejamos la URL original.
      } finally {
        clearTimeout(timeout);
      }
    }),
  );
}

/**
 * Convierte el lienzo de un formmenu (MenuCanvas) en una imagen JPEG lista para
 * subirse como media. El elemento debe estar montado a tamaño real de
 * escenario; MenuCanvas en modo `snapshot` lo garantiza.
 */
export async function captureMenuImage(element: HTMLElement): Promise<Blob> {
  if (typeof document !== "undefined" && document.fonts) {
    await document.fonts.ready;
  }

  await inlineImagesForCapture(element);

  // Espera dos frames para que el navegador aplique el layout y pinte el fondo.
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#000000",
    scale: 1,
    width: element.offsetWidth,
    height: element.offsetHeight,
    logging: false,
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("No se pudo generar la imagen del formmenu."));
        }
      },
      "image/jpeg",
      0.92,
    );
  });
}
