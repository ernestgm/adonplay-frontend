"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MenuConfig,
  MenuItem,
  MenuOrientation,
  STAGE_SIZES,
  autoLayout,
  itemPriceLabel,
} from "./menuTypes";

interface MenuCanvasProps {
  config: MenuConfig;
  items: MenuItem[];
  orientation: MenuOrientation;
  backgroundUrl?: string;
  currency?: string;
  className?: string;
  interactive?: boolean;
  showHidden?: boolean;
  showGuides?: boolean;
  // Renderiza el lienzo a escala 1:1 con el escenario. Se usa para exportar
  // el menú a imagen antes de insertarlo en un slide.
  snapshot?: boolean;
  draggingId?: string | null;
  onDragStartItem?: (id: string) => void;
  onDragEndItem?: () => void;
  onDropCell?: (col: number, row: number) => void;
}

function useFitScale(width: number, height: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const next = Math.min(element.clientWidth / width, element.clientHeight / height);
      setScale(Number.isFinite(next) && next > 0 ? next : 0);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [width, height]);

  return { ref, scale };
}

export default function MenuCanvas({
  config,
  items,
  orientation,
  backgroundUrl,
  currency = "MXN",
  className = "",
  interactive = false,
  showHidden = false,
  showGuides = false,
  snapshot = false,
  draggingId = null,
  onDragStartItem,
  onDragEndItem,
  onDropCell,
}: MenuCanvasProps) {
  const variant = config[orientation];
  const stage = STAGE_SIZES[orientation];
  const { ref, scale: fitScale } = useFitScale(stage.width, stage.height);
  const scale = snapshot ? 1 : fitScale;
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoverCell, setHoverCell] = useState<{ col: number; row: number } | null>(null);

  const layout = useMemo(
    () => autoLayout(items, variant, orientation),
    [items, variant, orientation],
  );

  const rows = Math.max(variant.rows, layout.rows);
  const columns = Math.max(1, variant.columns);

  const occupancy = useMemo(() => {
    const occupied = new Set<string>();
    layout.items.forEach((item) => {
      const position = item.position?.[orientation];
      if (!position) return;
      for (let row = position.row; row < position.row + position.rowSpan; row += 1) {
        for (let col = position.col; col < position.col + position.colSpan; col += 1) {
          occupied.add(`${row}:${col}`);
        }
      }
    });
    return occupied;
  }, [layout.items, orientation]);

  const emptyCells = useMemo(() => {
    if (!interactive) return [];
    const cells: { col: number; row: number }[] = [];
    for (let row = 1; row <= rows; row += 1) {
      for (let col = 1; col <= columns; col += 1) {
        if (!occupancy.has(`${row}:${col}`)) cells.push({ col, row });
      }
    }
    return cells;
  }, [columns, rows, occupancy, interactive]);

  const fontSize = (percent: number) => `${(Number(percent) / 100) * stage.height}px`;
  const family = `${config.style.font_family || "Poppins"}, system-ui, sans-serif`;
  const visibleItems = layout.items.filter((item) => item.visible || showHidden);

  useEffect(() => {
    if (!draggingId) setHoverCell(null);
  }, [draggingId]);

  // Convierte la posición del puntero en una celda de la cuadrícula. El
  // contenedor puede estar escalado, así que se usan proporciones del rect.
  const cellFromEvent = (event: React.DragEvent): { col: number; row: number } | null => {
    const element = gridRef.current;
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;

    return {
      col: Math.min(columns, Math.max(1, Math.floor((x / rect.width) * columns) + 1)),
      row: Math.min(rows, Math.max(1, Math.floor((y / rect.height) * rows) + 1)),
    };
  };

  const handleDragOver = (event: React.DragEvent) => {
    if (!interactive) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setHoverCell(cellFromEvent(event));
  };

  const handleDragLeave = (event: React.DragEvent) => {
    if (!interactive) return;
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) return;
    setHoverCell(null);
  };

  const handleDrop = (event: React.DragEvent) => {
    if (!interactive) return;
    event.preventDefault();
    const cell = cellFromEvent(event) || hoverCell;
    setHoverCell(null);
    if (cell) onDropCell?.(cell.col, cell.row);
  };

  return (
    <div ref={ref} className={`relative overflow-hidden bg-black ${className}`}>
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: stage.width,
          height: stage.height,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: variant.background.fallback_color || "#0f172a" }}
        >
          {backgroundUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backgroundUrl}
              alt=""
              // html2canvas solo puede leer la imagen si se cargó con CORS.
              // El preview no lo necesita; el snapshot sí.
              crossOrigin={snapshot ? "anonymous" : undefined}
              className="h-full w-full"
              style={{
                objectFit: variant.background.fit === "contain" ? "contain" : "cover",
                opacity: Number(variant.background.image_opacity ?? 1),
              }}
            />
          )}
        </div>

        {Number(variant.background.overlay) > 0 && (
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: Number(variant.background.overlay) }}
          />
        )}

        <div
          ref={gridRef}
          className="absolute"
          data-menu-grid="true"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            left: variant.padding,
            right: variant.padding,
            top: variant.padding,
            bottom: variant.padding,
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gap: variant.gap,
          }}
        >
          {emptyCells.map((cell) => (
            <div
              key={`empty-${cell.row}-${cell.col}`}
              aria-hidden="true"
              className="pointer-events-none rounded-md border border-dashed border-white/10"
              style={{ gridColumn: `${cell.col} / span 1`, gridRow: `${cell.row} / span 1` }}
            />
          ))}

          {(showGuides || draggingId) &&
            Array.from({ length: rows }).flatMap((_, rowIndex) =>
              Array.from({ length: columns }).map((__, colIndex) => (
                <div
                  key={`guide-${rowIndex + 1}-${colIndex + 1}`}
                  className="pointer-events-none rounded-md border border-dashed"
                  style={{
                    gridColumn: `${colIndex + 1} / span 1`,
                    gridRow: `${rowIndex + 1} / span 1`,
                    borderColor: draggingId
                      ? "rgba(255,255,255,0.22)"
                      : "rgba(255,255,255,0.10)",
                  }}
                />
              )),
            )}

          {hoverCell && draggingId && (
            <div
              className="pointer-events-none rounded-md"
              style={{
                gridColumn: `${hoverCell.col} / span 1`,
                gridRow: `${hoverCell.row} / span 1`,
                border: "2px solid #22d3ee",
                backgroundColor: "rgba(34,211,238,0.18)",
                boxShadow: "0 0 0 1px rgba(34,211,238,0.35) inset",
                position: "relative",
                zIndex: 40,
              }}
            />
          )}

          {visibleItems.map((item) => {
            const position = item.position?.[orientation];
            if (!position) return null;
            const isSection = item.type === "section";
            const dimmed = !item.visible;
            const priceLabel = itemPriceLabel(item, currency);

            return (
              <div
                key={item.id}
                data-menu-item={item.id}
                draggable={interactive}
                onDragStart={() => onDragStartItem?.(item.id)}
                onDragEnd={() => onDragEndItem?.()}
                className={`flex min-w-0 flex-col justify-center overflow-hidden rounded-md ${
                  interactive ? "cursor-grab border border-white/10 px-2 py-1 active:cursor-grabbing" : ""
                }`}
                style={{
                  gridColumn: `${position.col} / span ${position.colSpan}`,
                  gridRow: `${position.row} / span ${position.rowSpan}`,
                  fontFamily: family,
                  opacity: draggingId === item.id ? 0.3 : dimmed ? 0.35 : 1,
                  transition: "opacity 120ms ease",
                }}
                title={interactive ? "Arrastra para mover" : undefined}
              >
                {isSection ? (
                  <div
                    className="truncate font-bold"
                    style={{
                      color: config.style.name_color,
                      fontSize: fontSize(config.style.title_size),
                      borderBottom: "2px solid rgba(255,255,255,0.25)",
                      paddingBottom: 8,
                    }}
                  >
                    {item.name}
                  </div>
                ) : (
                  <>
                    <div className="flex w-full min-w-0 items-baseline justify-between gap-3">
                      <span
                        className="min-w-0 flex-1 truncate font-semibold"
                        style={{
                          color: config.style.name_color,
                          fontSize: fontSize(config.style.item_size),
                        }}
                      >
                        {item.name}
                        {dimmed ? " · oculto" : ""}
                      </span>
                      {priceLabel ? (
                        <span
                          className="shrink-0 text-right font-semibold"
                          style={{
                            color: config.style.price_color,
                            fontSize: fontSize(config.style.price_size),
                          }}
                        >
                          {priceLabel}
                        </span>
                      ) : null}
                    </div>
                    {item.desc ? (
                      <span
                        className="truncate"
                        style={{
                          color: config.style.name_color,
                          opacity: 0.7,
                          fontSize: `${(Number(config.style.item_size) * 0.55 / 100) * stage.height}px`,
                        }}
                      >
                        {item.desc}
                      </span>
                    ) : null}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
