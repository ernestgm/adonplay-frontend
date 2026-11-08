export type MenuOrientation = "landscape" | "portrait";

export interface MenuCellPosition {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

export interface MenuBackground {
  media_id: number | null;
  fit: "cover" | "contain";
  overlay: number;
  image_opacity?: number;
  fallback_color?: string;
  file_path?: string;
  media_type?: string;
}

export interface MenuVariant {
  columns: number;
  rows: number;
  gap: number;
  padding: number;
  background: MenuBackground;
}

export interface MenuStyle {
  font_family: string;
  title_size: number;
  item_size: number;
  price_size: number;
  name_color: string;
  price_color: string;
}

export interface MenuConfig {
  version: number;
  cell_mode: "product";
  landscape: MenuVariant;
  portrait: MenuVariant;
  style: MenuStyle;
}

export interface MenuItem {
  id: string;
  type: "item" | "section";
  name: string;
  desc?: string;
  price_text: string;
  price_cents?: number | null;
  visible: boolean;
  position: Partial<Record<MenuOrientation, MenuCellPosition>>;
}

export const FONT_OPTIONS = [
  { value: "Poppins", label: "Poppins" },
  { value: "Inter", label: "Inter" },
  { value: "Arial", label: "Arial" },
  { value: "Verdana", label: "Verdana" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Georgia", label: "Georgia (serif)" },
  { value: "Courier New", label: "Courier New (mono)" },
  { value: "Impact", label: "Impact" },
];

export const CURRENCY_OPTIONS = [
  { value: "MXN", label: "Peso mexicano (MXN)" },
  { value: "USD", label: "Dólar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "COP", label: "Peso colombiano (COP)" },
  { value: "ARS", label: "Peso argentino (ARS)" },
  { value: "CLP", label: "Peso chileno (CLP)" },
  { value: "PEN", label: "Sol peruano (PEN)" },
  { value: "BRL", label: "Real brasileño (BRL)" },
  { value: "CAD", label: "Dólar canadiense (CAD)" },
  { value: "GBP", label: "Libra (GBP)" },
];

export const STAGE_SIZES: Record<MenuOrientation, { width: number; height: number }> = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

export function defaultMenuConfig(): MenuConfig {
  const background = (): MenuBackground => ({
    media_id: null,
    fit: "cover",
    overlay: 0.35,
    image_opacity: 1,
    fallback_color: "#0f172a",
  });

  return {
    version: 1,
    cell_mode: "product",
    landscape: { columns: 3, rows: 8, gap: 16, padding: 48, background: background() },
    portrait: { columns: 1, rows: 14, gap: 12, padding: 40, background: background() },
    style: {
      font_family: "Poppins",
      title_size: 7.5,
      item_size: 4.2,
      price_size: 4.2,
      name_color: "#ffffff",
      price_color: "#facc15",
    },
  };
}

export function mergeMenuConfig(raw: any): MenuConfig {
  const base = defaultMenuConfig();
  if (!raw || typeof raw !== "object") return base;

  const mergeVariant = (key: MenuOrientation): MenuVariant => {
    const incoming = raw[key] || {};
    return {
      columns: clamp(Number(incoming.columns) || base[key].columns, 1, 12),
      rows: clamp(Number(incoming.rows) || base[key].rows, 1, 60),
      gap: clamp(Number(incoming.gap ?? base[key].gap), 0, 200),
      padding: clamp(Number(incoming.padding ?? base[key].padding), 0, 400),
      background: {
        ...base[key].background,
        ...(incoming.background || {}),
        media_id: incoming.background?.media_id ?? null,
        overlay: clamp(Number(incoming.background?.overlay ?? base[key].background.overlay), 0, 0.95),
        image_opacity: clamp(
          Number(incoming.background?.image_opacity ?? base[key].background.image_opacity ?? 1),
          0,
          1,
        ),
      },
    };
  };

  return {
    version: 1,
    cell_mode: "product",
    landscape: mergeVariant("landscape"),
    portrait: mergeVariant("portrait"),
    style: {
      ...base.style,
      ...(raw.style || {}),
    },
  };
}

let itemSequence = 0;

export function newMenuItem(type: "item" | "section" = "item"): MenuItem {
  itemSequence += 1;
  return {
    id: `item-${Date.now()}-${itemSequence}`,
    type,
    name: type === "section" ? "Nueva sección" : "Nuevo producto",
    desc: "",
    price_text: "",
    price_cents: null,
    visible: true,
    position: {},
  };
}

/**
 * Acomoda los ítems dentro de la cuadrícula respetando las posiciones
 * manuales que sigan siendo válidas. Los que no tienen posición (o quedaron
 * fuera de rango) se colocan en el siguiente hueco libre.
 */
export function autoLayout(
  items: MenuItem[],
  variant: MenuVariant,
  orientation: MenuOrientation,
  priorityId?: string,
): { items: MenuItem[]; rows: number } {
  const columns = clamp(Number(variant.columns) || 1, 1, 12);
  const baseRows = clamp(Number(variant.rows) || 1, 1, 60);
  const occupied = new Set<string>();
  const result = new Map<string, MenuCellPosition>();

  const key = (row: number, col: number) => `${row}:${col}`;

  const fits = (row: number, col: number, colSpan: number, rowSpan: number, respectRows: boolean) => {
    if (row < 1 || col < 1) return false;
    if (col + colSpan - 1 > columns) return false;
    if (respectRows && row + rowSpan - 1 > baseRows) return false;

    for (let r = row; r < row + rowSpan; r += 1) {
      for (let c = col; c < col + colSpan; c += 1) {
        if (occupied.has(key(r, c))) return false;
      }
    }
    return true;
  };

  const occupy = (row: number, col: number, colSpan: number, rowSpan: number) => {
    for (let r = row; r < row + rowSpan; r += 1) {
      for (let c = col; c < col + colSpan; c += 1) {
        occupied.add(key(r, c));
      }
    }
  };

  // El ítem que el usuario acaba de mover tiene prioridad para conservar su celda.
  const ordered = [...items].sort((a, b) => {
    if (a.id === priorityId) return -1;
    if (b.id === priorityId) return 1;
    return 0;
  });

  for (const item of ordered) {
    const pos = item.position?.[orientation];
    if (!pos) continue;

    const colSpan = item.type === "section"
      ? columns
      : clamp(Number(pos.colSpan) || 1, 1, columns);
    const rowSpan = clamp(Number(pos.rowSpan) || 1, 1, baseRows);

    if (fits(Number(pos.row), Number(pos.col), colSpan, rowSpan, true)) {
      result.set(item.id, {
        col: Number(pos.col),
        row: Number(pos.row),
        colSpan,
        rowSpan,
      });
      occupy(Number(pos.row), Number(pos.col), colSpan, rowSpan);
    }
  }

  for (const item of items) {
    if (result.has(item.id)) continue;

    const colSpan = item.type === "section" ? columns : 1;
    const rowSpan = 1;
    let target: { row: number; col: number } | null = null;

    for (let row = 1; row <= 400 && !target; row += 1) {
      for (let col = 1; col <= columns; col += 1) {
        if (fits(row, col, colSpan, rowSpan, false)) {
          target = { row, col };
          break;
        }
      }
    }

    const pos = target || { row: 1, col: 1 };
    result.set(item.id, { ...pos, colSpan, rowSpan });
    occupy(pos.row, pos.col, colSpan, rowSpan);
  }

  const maxRow = Math.max(
    baseRows,
    ...Array.from(result.values()).map((pos) => pos.row + pos.rowSpan - 1),
  );

  return {
    items: items.map((item) => ({
      ...item,
      position: {
        ...item.position,
        [orientation]: result.get(item.id)!,
      },
    })),
    rows: maxRow,
  };
}

export function normalizeMenuItems(raw: any): MenuItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: any, index: number) => ({
    id: String(item?.id || `item-${index + 1}`),
    type: item?.type === "section" ? "section" : "item",
    name: String(item?.name || ""),
    desc: String(item?.desc || ""),
    price_text: String(item?.price_text || ""),
    price_cents: item?.price_cents == null ? null : Number(item.price_cents),
    visible: item?.visible !== false,
    position: item?.position && typeof item.position === "object" ? item.position : {},
  }));
}

export function formatMoney(cents: number | null | undefined, currency = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(cents || 0) / 100);
}

export function itemHasPrice(item: MenuItem): boolean {
  return String(item.price_text || "").trim().length > 0 || Number(item.price_cents || 0) > 0;
}

export function itemPriceLabel(item: MenuItem, currency = "MXN"): string {
  const text = String(item.price_text || "").trim();
  if (text) return text;
  if (Number(item.price_cents) > 0) return formatMoney(item.price_cents, currency);
  return "";
}

export function currencySymbol(currency = "MXN"): string {
  try {
    const parts = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
    }).formatToParts(0);
    return parts.find((part) => part.type === "currency")?.value || "$";
  } catch {
    return "$";
  }
}

export function formatCentsForInput(cents: number | null | undefined): string {
  if (cents == null || cents === 0) return "";
  return (Number(cents) / 100).toFixed(2);
}

export function parseMoneyToCents(value: string): number | null {
  const clean = String(value ?? "").replace(/[^\d.,]/g, "").replace(",", ".");
  if (!clean) return null;
  const number = Number(clean);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.round(number * 100);
}
