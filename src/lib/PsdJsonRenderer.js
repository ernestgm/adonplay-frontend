

const ENV_FONT_SERVER = process.env.NEXT_PUBLIC_FONT_SERVER;
/**
 * PsdJsonRenderer - Librería modular para renderizar JSON de PSD en Canvas
 */
export class PsdJsonRenderer {
    constructor(config = {}) {
        this.loadedFonts = new Map();

        // Carga la URL desde variables de entorno (Vite: import.meta.env | CRA: process.env)
        const envUrl = ENV_FONT_SERVER || '';

        this.serverFontBaseUrl = config.serverFontBaseUrl || envUrl;
        this.fontManifest = config.fontManifest || {};

        this.blendModeMap = {
            'normal': 'source-over', 'passthru': 'source-over', 'multiply': 'multiply',
            'screen': 'screen', 'overlay': 'overlay', 'darken': 'darken',
            'lighten': 'lighten', 'color_dodge': 'color-dodge', 'color_burn': 'color-burn',
            'hard_light': 'hard-light', 'soft_light': 'soft-light', 'difference': 'difference',
            'exclusion': 'exclusion', 'hue': 'hue', 'saturation': 'saturation',
            'color': 'color', 'luminosity': 'luminosity',
        };
    }

    // --- MÉTODOS PÚBLICOS ---

    async render(canvas, jsonData) {
        if (!canvas || !jsonData) return;
        const ctx = canvas.getContext('2d');
        const { width, height, descendants } = jsonData;

        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);

        // Aseguramos que el motor de fuentes del navegador esté listo
        await document.fonts.ready;

        const rootNodes = descendants.filter(n => n.parentNodeIndex === null);

        // Renderizado recursivo desde el fondo hacia arriba
        for (let i = rootNodes.length - 1; i >= 0; i--) {
            await this._renderNode(ctx, rootNodes[i], width, height);
        }
        return canvas;
    }

    // --- LÓGICA DE FUENTES (SERVIDOR) ---

    /**
     * Cascada de resolución de fuentes
     */
    async _ensureFontIsLoaded(fontName) {
        const normalized = fontName.toLowerCase();

        // 1. Verificar si ya está en caché o cargada
        if (this.loadedFonts.has(normalized)) {
            return true;
        }

        // 2. Intentar cargar desde TU SERVIDOR (Variable de entorno)
        const serverLoaded = await this._loadFromServer(fontName);
        if (serverLoaded) return true;

        // 3. Intentar cargar desde GOOGLE FONTS
        const googleLoaded = await this._loadFromGoogleFonts(fontName);
        if (googleLoaded) return true;

        // 4. Verificar si existe en el SISTEMA (Font Enumeration / Check)
        // Si el check falla aquí, usaremos la fuente por defecto del navegador en el renderizado
        if (document.fonts.check(`12px "${fontName}"`)) {
            this.loadedFonts.set(normalized, fontName);
            return true;
        }

        return false;
    }

    async _loadFromServer(fontName) {

        if (!this.serverFontBaseUrl) return false;

        const normalized = fontName.toLowerCase();
        const fontFile = this.fontManifest[normalized] || `${fontName}.ttf`;
        const fontUrl = `${this.serverFontBaseUrl}${fontFile}`;

        try {
            // Verificamos si el archivo existe antes de crear el FontFace para evitar errores 404 en consola
            const response = await fetch(fontUrl, { method: 'HEAD' });
            if (!response.ok) return false;

            const fontFace = new FontFace(fontName, `url(${fontUrl})`);
            const loaded = await fontFace.load();
            document.fonts.add(loaded);
            this.loadedFonts.set(normalized, fontName);
            return true;
        } catch (e) {
            return false;
        }
    }

    async _loadFromGoogleFonts(fontName) {
        try {
            // Convertimos el nombre a formato Google (ej: "Roboto Medium" -> "Roboto")
            const familyParam = fontName.replace(/\s+/g, '+');
            const googleUrl = `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap`;

            const response = await fetch(googleUrl);
            if (!response.ok) return false;

            // Creamos un link dinámico para cargar el CSS de Google
            return new Promise((resolve) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = googleUrl;
                link.onload = () => {
                    this.loadedFonts.set(fontName.toLowerCase(), fontName);
                    resolve(true);
                };
                link.onerror = () => resolve(false);
                document.head.appendChild(link);
            });
        } catch (e) {
            return false;
        }
    }

    // --- MÉTODOS DE RENDERIZADO (Se mantienen igual que la versión anterior) ---
    // ... render(), _renderNode(), _renderText(), etc.

    _resolveFont(fontInfo, idx) {
        const name = this._getArr(fontInfo.names, idx, 'Arial');
        const size = this._getArr(fontInfo.sizes, idx, 12);
        const normalized = name.toLowerCase();

        // Si la fuente no está en nuestro mapa de éxito, usamos 'sans-serif' como última opción
        const family = this.loadedFonts.has(normalized) ? name : 'sans-serif';

        return { family, size, style: 'normal', weight: 'normal' };
    }

    // --- LÓGICA DE RENDERIZADO INTERNO ---

    async _renderNode(ctx, node, width, height) {
        if (!node.visible) return;
        const opacity = node.opacity ?? 1.0;
        const blendMode = this.blendModeMap[node.blendingMode] || 'source-over';

        ctx.save();
        ctx.globalAlpha *= opacity;
        ctx.globalCompositeOperation = blendMode;

        if (node.type === 'group') {
            const groupCanvas = document.createElement('canvas');
            groupCanvas.width = width;
            groupCanvas.height = height;
            const groupCtx = groupCanvas.getContext('2d');
            const children = node.children || [];

            for (let i = children.length - 1; i >= 0; i--) {
                await this._renderNode(groupCtx, children[i], width, height);
            }
            ctx.drawImage(groupCanvas, 0, 0);
        } else {
            if (node.src) {
                const img = await this._loadImage(node.src);
                ctx.drawImage(img, node.left || 0, node.top || 0);
            } else if (node.text) {
                await this._renderText(ctx, node);
            }
        }
        ctx.restore();
    }

    async _renderText(ctx, node) {
        const textInfo = node.text;
        const fontInfo = textInfo.font || {};
        const textValue = String(textInfo.value ?? '');

        // Carga de fuentes necesarias antes de medir texto
        const uniqueFonts = [...new Set(fontInfo.names || [])];
        await Promise.all(uniqueFonts.map(f => this._ensureFontIsLoaded(f)));

        const { left, top, width } = this._getTextBounds(node, textInfo);
        const runs = this._splitTextRuns(textValue, fontInfo.lengthArray || []);
        const lines = this._buildLinesFromRuns(runs);

        ctx.save();
        ctx.textBaseline = 'top';
        ctx.translate(left, top);

        if (textInfo.transform) {
            const t = textInfo.transform;
            ctx.transform(t.xx, t.yx, t.xy, t.yy, 0, 0);
        }

        let currentY = 0;
        for (const lineSegments of lines) {
            if (lineSegments.length === 0) { currentY += 12; continue; }

            let totalLineWidth = 0;
            const segmentsWithMetrics = lineSegments.map(seg => {
                const fontRes = this._resolveFont(fontInfo, seg.runIndex);
                ctx.font = this._buildFontString(fontRes);
                return { ...seg, fontRes, width: ctx.measureText(seg.text).width };
            });

            segmentsWithMetrics.forEach(s => totalLineWidth += s.width);

            const align = this._mapAlignment(this._getArr(fontInfo.alignment, lineSegments[0].runIndex, 'left'));
            let currentX = align === 'center' ? (width - totalLineWidth) / 2 : (align === 'right' ? width - totalLineWidth : 0);

            let maxLineHeight = 0;
            for (const seg of segmentsWithMetrics) {
                ctx.font = this._buildFontString(seg.fontRes);
                ctx.fillStyle = this._normalizeColor(this._getArr(fontInfo.colors, seg.runIndex, '#000000'));
                ctx.fillText(seg.text, currentX, currentY);
                currentX += seg.width;

                const leading = this._getArr(fontInfo.leading, seg.runIndex, 0);
                maxLineHeight = Math.max(maxLineHeight, leading > 0 ? leading : seg.fontRes.size * 1.2);
            }
            currentY += maxLineHeight;
        }
        ctx.restore();
    }

    // --- HELPERS ---

    _loadImage(src) {
        return new Promise((res, rej) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => res(img);
            img.onerror = rej;
            img.src = src;
        });
    }

    _getTextBounds(node, textInfo) {
        const left = node.left ?? textInfo.left ?? textInfo.transform?.tx ?? 0;
        const top = node.top ?? textInfo.top ?? textInfo.transform?.ty ?? 0;
        return { left, top, width: node.width ?? 0 };
    }

    _buildFontString(f) { return `${f.style} ${f.weight} ${f.size}px "${f.family}"`; }

    _getArr(arr, idx, fallback) {
        return (Array.isArray(arr) && arr.length > 0) ? (arr[idx] ?? arr[0]) : fallback;
    }

    _normalizeColor(c) {
        if (Array.isArray(c)) return `rgba(${c[0]},${c[1]},${c[2]},${(c[3]||255)/255})`;
        return c;
    }

    _mapAlignment(a) {
        if (typeof a !== 'string') return 'left';
        if (a.includes('center')) return 'center';
        if (a.includes('right')) return 'right';
        return 'left';
    }

    _splitTextRuns(text, lens) {
        if (!lens || lens.length === 0) return [{ text, runIndex: 0 }];
        let cur = 0;
        return lens.map((l, i) => {
            const t = text.slice(cur, cur + l);
            cur += l;
            return { text: t, runIndex: i };
        });
    }

    _buildLinesFromRuns(runs) {
        const lines = [[]];
        runs.forEach(run => {
            const parts = run.text.split(/\r\n|\r|\n/);
            parts.forEach((p, i) => {
                if (i > 0) lines.push([]);
                if (p) lines[lines.length - 1].push({ text: p, runIndex: run.runIndex });
            });
        });
        return lines;
    }
}