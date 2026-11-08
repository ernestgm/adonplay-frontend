"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import { useError } from "@/context/ErrorContext";
import { fetchBusinesses } from "@/server/api/business";
import { fetchMedia } from "@/server/api/media";
import { createSlide, updateSlide } from "@/server/api/slides";
import mediaUrl from "@/utils/files";
import { refreshMenuSnapshots } from "@/utils/menuSnapshotRefresh";
import MenuCanvas from "@/components/app/menus/MenuCanvas";
import {
  FONT_OPTIONS,
  MenuConfig,
  MenuItem,
  MenuOrientation,
  autoLayout,
  currencySymbol,
  itemHasPrice,
  mergeMenuConfig,
  newMenuItem,
  normalizeMenuItems,
} from "@/components/app/menus/menuTypes";

interface MenuEditorFormProps {
  slide?: any;
}

const ORIENTATIONS: { value: MenuOrientation; label: string }[] = [
  { value: "landscape", label: "Horizontal" },
  { value: "portrait", label: "Vertical" },
];

const MenuEditorForm: React.FC<MenuEditorFormProps> = ({ slide }) => {
  const router = useRouter();
  const setError = useError().setError;

  const [name, setName] = useState(slide?.name || "");
  const [businessId, setBusinessId] = useState(slide?.business_id || "");
  const [config, setConfig] = useState<MenuConfig>(() => mergeMenuConfig(slide?.menu?.config));
  const [items, setItems] = useState<MenuItem[]>(() => normalizeMenuItems(slide?.menu?.items));
  const [orientation, setOrientation] = useState<MenuOrientation>("landscape");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingColumn, setDraggingColumn] = useState<number | null>(null);
  const [hoverColumn, setHoverColumn] = useState<number | null>(null);
  const [showGuides, setShowGuides] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [businessData, mediaData] = await Promise.all([fetchBusinesses(), fetchMedia()]);
        setBusinesses(Array.isArray(businessData) ? businessData : []);
        setMedia(Array.isArray(mediaData) ? mediaData.filter((item: any) => item.media_type === "image") : []);
      } catch (err: any) {
        setError(err.data?.message || err.message || "No se pudieron cargar los datos del formmenu.");
      }
    };
    load();
  }, [setError]);

  const variant = config[orientation];
  const currency = useMemo(
    () => businesses.find((business) => String(business.id) === String(businessId))?.currency || "MXN",
    [businesses, businessId],
  );
  const symbol = currencySymbol(currency);

  const backgroundMedia = useMemo(
    () => media.find((item) => String(item.id) === String(variant.background.media_id)),
    [media, variant.background.media_id],
  );

  const backgroundUrl = backgroundMedia ? mediaUrl(backgroundMedia.file_path) : "";

  const updateVariant = (patch: Partial<MenuConfig["landscape"]>) => {
    setConfig((prev) => ({
      ...prev,
      [orientation]: { ...prev[orientation], ...patch },
    }));
  };

  const updateBackground = (patch: Partial<MenuConfig["landscape"]["background"]>) => {
    setConfig((prev) => ({
      ...prev,
      [orientation]: {
        ...prev[orientation],
        background: { ...prev[orientation].background, ...patch },
      },
    }));
  };

  const updateStyle = (patch: Partial<MenuConfig["style"]>) => {
    setConfig((prev) => ({ ...prev, style: { ...prev.style, ...patch } }));
  };

  const updateItem = (id: string, patch: Partial<MenuItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const toggleVisible = (item: MenuItem, checked: boolean) => {
    if (checked && item.type !== "section" && !itemHasPrice(item)) {
      setFormError(`Agrega un precio a "${item.name}" para poder activarlo.`);
      return;
    }
    setFormError("");
    updateItem(item.id, { visible: checked });
  };

  const addItem = (type: "item" | "section") => {
    setFormError("");
    setItems((prev) => [...prev, newMenuItem(type)]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const autoArrange = () => {
    setItems((prev) => {
      let next = prev.map((item) => ({ ...item, position: {} }));
      (["landscape", "portrait"] as const).forEach((key) => {
        next = autoLayout(next, config[key], key).items;
      });
      return next;
    });
  };

  const handleDropCell = (col: number, row: number) => {
    if (!draggingId) return;

    setItems((prev) => {
      const dragged = prev.find((item) => item.id === draggingId);
      if (!dragged) return prev;

      const columns = Math.max(1, config[orientation].columns);
      const position = {
        col: Math.min(Math.max(1, col), columns),
        row: Math.max(1, row),
        colSpan: dragged.type === "section" ? columns : 1,
        rowSpan: 1,
      };

      const updated = prev.map((item) =>
        item.id === draggingId
          ? { ...item, position: { ...item.position, [orientation]: position } }
          : item,
      );

      return autoLayout(updated, config[orientation], orientation, draggingId).items;
    });

    setDraggingId(null);
  };

  // Intercambia dos columnas completas. Primero materializa las posiciones
  // (incluidos los ítems que aún no se habían movido) y luego cambia la
  // columna de cada producto. Las secciones de fila completa no se tocan.
  const moveColumn = (from: number, to: number) => {
    if (from === to) return;

    setItems((prev) => {
      const base = autoLayout(prev, config[orientation], orientation).items;

      return base.map((item) => {
        const position = item.position?.[orientation];
        if (!position || position.colSpan > 1) return item;

        if (position.col === from || position.col === to) {
          return {
            ...item,
            position: {
              ...item.position,
              [orientation]: {
                ...position,
                col: position.col === from ? to : from,
              },
            },
          };
        }

        return item;
      });
    });
  };

  const buildPayload = () => {
    let nextItems = items;
    const nextConfig: MenuConfig = { ...config };

    (["landscape", "portrait"] as const).forEach((key) => {
      const maxUsedRow = nextItems.reduce(
        (max, item) => Math.max(max, Number(item.position?.[key]?.row || 0)),
        0,
      );
      const base = {
        ...nextConfig[key],
        rows: Math.max(nextConfig[key].rows, maxUsedRow),
      };
      const laidOut = autoLayout(nextItems, base, key);
      nextItems = laidOut.items;
      nextConfig[key] = { ...base, rows: Math.max(base.rows, laidOut.rows) };
    });

    return {
      name,
      business_id: businessId,
      layout: "menu",
      menu_config: nextConfig,
      menu_items: nextItems,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("El nombre del formmenu es obligatorio.");
      return;
    }
    if (!businessId) {
      setFormError("Selecciona un negocio.");
      return;
    }

    const invalidItem = items.find(
      (item) => item.visible && item.type !== "section" && !itemHasPrice(item),
    );
    if (invalidItem) {
      setFormError(`Agrega un precio a "${invalidItem.name}" o desactívalo antes de guardar.`);
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      if (slide?.id) {
        await updateSlide(slide.id, payload);
        // Si el formmenu está insertado como imagen en algún slide, regeneramos
        // esas imágenes antes de salir del editor.
        try {
          await refreshMenuSnapshots(slide.id);
        } catch (refreshError) {
          console.error("No se pudieron refrescar las imágenes del formmenu", refreshError);
        }
        router.push("/menus");
      } else {
        await createSlide(payload);
        router.push("/menus");
      }
    } catch (err: any) {
      const errors = err.data?.errors;
      const firstError = errors && typeof errors === "object"
        ? Object.values(errors).flat().filter(Boolean)[0]
        : null;
      setFormError(String(firstError || err.data?.message || "No se pudo guardar el formmenu."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-lg border border-error-500/40 bg-error-500/10 px-4 py-3 text-sm text-error-600">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-theme-xs">
            <h3 className="mb-4 text-base font-semibold text-content-primary">Datos del formmenu</h3>
            <div className="space-y-4">
              <div>
                <Label>Nombre *</Label>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div>
                <Label>Negocio *</Label>
                <Select
                  key={`business-${businessId}`}
                  defaultValue={String(businessId)}
                  placeholder="Selecciona un negocio"
                  options={businesses.map((business) => ({ value: String(business.id), label: business.name }))}
                  onChange={(value) => setBusinessId(value)}
                />
              </div>
              <p className="text-xs text-content-muted">
                Moneda del negocio: <span className="font-semibold">{currency}</span> ({symbol})
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5 shadow-theme-xs">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-content-primary">Cuadrícula</h3>
              <div className="inline-flex rounded-lg border border-line p-1">
                {ORIENTATIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setOrientation(option.value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      orientation === option.value
                        ? "bg-brand-500 text-white"
                        : "text-content-secondary hover:bg-surface-hover"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Columnas</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={variant.columns}
                  onChange={(event) => updateVariant({ columns: Math.max(1, Number(event.target.value) || 1) })}
                />
              </div>
              <div>
                <Label>Filas</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={variant.rows}
                  onChange={(event) => updateVariant({ rows: Math.max(1, Number(event.target.value) || 1) })}
                />
              </div>
              <div>
                <Label>Separación</Label>
                <Input
                  type="number"
                  min="0"
                  max="200"
                  value={variant.gap}
                  onChange={(event) => updateVariant({ gap: Math.max(0, Number(event.target.value) || 0) })}
                />
              </div>
              <div>
                <Label>Margen</Label>
                <Input
                  type="number"
                  min="0"
                  max="400"
                  value={variant.padding}
                  onChange={(event) => updateVariant({ padding: Math.max(0, Number(event.target.value) || 0) })}
                />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <Label>Imagen de fondo</Label>
                <Select
                  key={`background-${orientation}-${variant.background.media_id ?? "none"}`}
                  defaultValue={variant.background.media_id ? String(variant.background.media_id) : ""}
                  placeholder="Sin fondo"
                  options={[
                    { value: "", label: "Sin fondo" },
                    ...media.map((item) => ({
                      value: String(item.id),
                      label: String(item.file_path || `Media #${item.id}`).split("/").pop() || `Media #${item.id}`,
                    })),
                  ]}
                  onChange={(value) => updateBackground({ media_id: value ? Number(value) : null })}
                />
              </div>

              {backgroundUrl && (
                <div className="overflow-hidden rounded-lg border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={backgroundUrl} alt="Fondo" className="h-28 w-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Ajuste</Label>
                  <Select
                    key={`fit-${orientation}-${variant.background.fit}`}
                    defaultValue={variant.background.fit}
                    onChange={(value) => updateBackground({ fit: value as "cover" | "contain" })}
                    options={[
                      { value: "cover", label: "Cubrir" },
                      { value: "contain", label: "Contener" },
                    ]}
                  />
                </div>
                <div>
                  <Label>Oscurecer: {Math.round(Number(variant.background.overlay) * 100)}%</Label>
                  <input
                    type="range"
                    min="0"
                    max="0.9"
                    step="0.05"
                    value={variant.background.overlay}
                    onChange={(event) => updateBackground({ overlay: Number(event.target.value) })}
                    className="mt-3 w-full accent-brand-500"
                  />
                </div>
              </div>

              <div>
                <Label>
                  Transparencia del fondo:{" "}
                  {Math.round((1 - Number(variant.background.image_opacity ?? 1)) * 100)}%
                </Label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={1 - Number(variant.background.image_opacity ?? 1)}
                  onChange={(event) =>
                    updateBackground({ image_opacity: 1 - Number(event.target.value) })
                  }
                  className="mt-3 w-full accent-brand-500"
                />
                <p className="mt-1 text-xs text-content-muted">
                  0% = imagen opaca · 100% = imagen invisible (se ve el color de respaldo).
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5 shadow-theme-xs">
            <h3 className="mb-4 text-base font-semibold text-content-primary">Estilo</h3>
            <div className="space-y-4">
              <div>
                <Label>Fuente</Label>
                <Select
                  key={`font-${config.style.font_family}`}
                  defaultValue={config.style.font_family}
                  options={FONT_OPTIONS}
                  onChange={(value) => updateStyle({ font_family: value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Título</Label>
                  <Input
                    type="number"
                    step={0.1}
                    min="1"
                    max="30"
                    value={config.style.title_size}
                    onChange={(event) => updateStyle({ title_size: Number(event.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Producto</Label>
                  <Input
                    type="number"
                    step={0.1}
                    min="1"
                    max="30"
                    value={config.style.item_size}
                    onChange={(event) => updateStyle({ item_size: Number(event.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Precio</Label>
                  <Input
                    type="number"
                    step={0.1}
                    min="1"
                    max="30"
                    value={config.style.price_size}
                    onChange={(event) => updateStyle({ price_size: Number(event.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Color del texto</Label>
                  <input
                    type="color"
                    value={config.style.name_color}
                    onChange={(event) => updateStyle({ name_color: event.target.value })}
                    className="h-11 w-full cursor-pointer rounded-lg border border-line-strong bg-surface p-1"
                  />
                </div>
                <div>
                  <Label>Color del precio</Label>
                  <input
                    type="color"
                    value={config.style.price_color}
                    onChange={(event) => updateStyle({ price_color: event.target.value })}
                    className="h-11 w-full cursor-pointer rounded-lg border border-line-strong bg-surface p-1"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-theme-xs">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-content-primary">Vista previa</h3>
              <div className="flex items-center gap-4">
                <Checkbox checked={showGuides} onChange={setShowGuides} label="Guías" />
                <Button type="button" variant="outline" size="sm" onClick={autoArrange}>
                  Auto acomodar
                </Button>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-content-secondary">Mover columnas:</span>
              {Array.from({ length: Math.max(1, config[orientation].columns) }).map((_, index) => {
                const column = index + 1;
                const isDragging = draggingColumn === column;
                const isHover =
                  hoverColumn === column && draggingColumn !== null && draggingColumn !== column;

                return (
                  <div
                    key={column}
                    draggable
                    data-column-chip={column}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", String(column));
                      setDraggingColumn(column);
                    }}
                    onDragEnd={() => {
                      setDraggingColumn(null);
                      setHoverColumn(null);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setHoverColumn(column);
                    }}
                    onDragLeave={() =>
                      setHoverColumn((current) => (current === column ? null : current))
                    }
                    onDrop={(event) => {
                      event.preventDefault();
                      const raw = event.dataTransfer.getData("text/plain");
                      const from = raw ? Number(raw) : draggingColumn;
                      if (from) moveColumn(from, column);
                      setDraggingColumn(null);
                      setHoverColumn(null);
                    }}
                    className={`flex cursor-grab items-center gap-1 rounded-lg border px-1 py-1 text-xs transition-colors active:cursor-grabbing ${
                      isDragging
                        ? "border-brand-500 bg-brand-500/10 opacity-60"
                        : isHover
                          ? "border-brand-500 bg-brand-500/10"
                          : "border-line bg-surface"
                    }`}
                    title={`Columna ${column}: arrastra para intercambiar`}
                  >
                    <button
                      type="button"
                      onClick={() => moveColumn(column, column - 1)}
                      disabled={column === 1}
                      aria-label={`Mover columna ${column} a la izquierda`}
                      className="rounded px-1.5 py-1 text-content-secondary disabled:opacity-30"
                    >
                      ←
                    </button>
                    <span className="min-w-5 text-center font-semibold text-content-primary">
                      {column}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveColumn(column, column + 1)}
                      disabled={column === config[orientation].columns}
                      aria-label={`Mover columna ${column} a la derecha`}
                      className="rounded px-1.5 py-1 text-content-secondary disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>
                );
              })}
              <span className="text-xs text-content-muted">
                Arrastra los números o usa las flechas para intercambiar columnas completas.
              </span>
            </div>

            <div
              className={
                orientation === "landscape"
                  ? "w-full"
                  : "mx-auto w-full max-w-[360px]"
              }
            >
              <MenuCanvas
                config={config}
                items={items}
                orientation={orientation}
                backgroundUrl={backgroundUrl}
                currency={currency}
                interactive
                showHidden
                showGuides={showGuides}
                draggingId={draggingId}
                onDragStartItem={setDraggingId}
                onDragEndItem={() => setDraggingId(null)}
                onDropCell={handleDropCell}
                className={`rounded-xl border border-line ${
                  orientation === "landscape" ? "aspect-video" : "aspect-[9/16]"
                }`}
              />
            </div>

            <p className="mt-3 text-xs text-content-muted">
              Arrastra un producto a otra celda: la celda destino se resalta y el elemento se ajusta a la cuadrícula.
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5 shadow-theme-xs">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-content-primary">
                Productos ({items.filter((item) => item.type === "item").length})
              </h3>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => addItem("section")}>
                  + Sección
                </Button>
                <Button type="button" size="sm" onClick={() => addItem("item")}>
                  + Producto
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {items.length === 0 && (
                <p className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-sm text-content-muted">
                  Agrega el primer producto o sección del formmenu.
                </p>
              )}

              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 items-start gap-2 rounded-lg border border-line bg-surface-sunken/40 p-3 sm:grid-cols-[auto_minmax(0,1fr)_130px_170px_auto]"
                >
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      checked={item.visible}
                      onChange={(checked) => toggleVisible(item, checked)}
                    />
                  </div>

                  <Input
                    value={item.name}
                    placeholder={item.type === "section" ? "Nombre de la sección" : "Nombre del producto"}
                    onChange={(event) => updateItem(item.id, { name: event.target.value })}
                  />

                  <Select
                    key={`type-${item.id}-${item.type}`}
                    defaultValue={item.type}
                    options={[
                      { value: "item", label: "Producto" },
                      { value: "section", label: "Sección" },
                    ]}
                    onChange={(value) => updateItem(item.id, { type: value as "item" | "section" })}
                  />

                  <div className="relative">
                    {item.type === "section" ? (
                      <div className="flex h-11 items-center justify-center rounded-lg border border-line bg-surface-sunken text-sm text-content-muted">
                        —
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={item.price_text || ""}
                        placeholder={`ej. ${symbol}3.50 · ${symbol}3/lb`}
                        onChange={(event) =>
                          updateItem(item.id, {
                            price_text: event.target.value,
                            price_cents: null,
                          })
                        }
                        className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-content-primary"
                      />
                    )}
                  </div>

                  <Button type="button" size="sm" variant="danger" onClick={() => removeItem(item.id)}>
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/menus")}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {slide?.id ? "Guardar cambios" : "Crear formmenu"}
        </Button>
      </div>
    </form>
  );
};

export default MenuEditorForm;
