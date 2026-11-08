"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import { useError } from "@/context/ErrorContext";
import { useMessage } from "@/context/MessageContext";
import { updateMenuValues } from "@/server/api/slides";
import MenuCanvas from "@/components/app/menus/MenuCanvas";
import mediaUrl from "@/utils/files";
import { refreshMenuSnapshots } from "@/utils/menuSnapshotRefresh";
import {
  MenuConfig,
  MenuItem,
  MenuOrientation,
  currencySymbol,
  formatMoney,
  itemHasPrice,
  mergeMenuConfig,
  normalizeMenuItems,
} from "@/components/app/menus/menuTypes";

interface MenuValuesFormProps {
  slide: any;
}

const MenuValuesForm: React.FC<MenuValuesFormProps> = ({ slide }) => {
  const router = useRouter();
  const setError = useError().setError;
  const setMessage = useMessage().setMessage;

  const config: MenuConfig = useMemo(() => mergeMenuConfig(slide?.menu?.config), [slide]);
  const currency = slide?.business?.currency || "MXN";
  const [items, setItems] = useState<MenuItem[]>(() =>
    normalizeMenuItems(slide?.menu?.items).map((item) => ({
      ...item,
      // Los formmenu viejos guardaban price_cents. Se convierten a texto una vez
      // para que el formulario rápido siempre muestre algo editable.
      price_text:
        item.price_text ||
        (item.price_cents ? formatMoney(item.price_cents, slide?.business?.currency || "MXN") : ""),
    })),
  );
  const [orientation, setOrientation] = useState<MenuOrientation>("landscape");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [lastSaved, setLastSaved] = useState(false);

  const symbol = currencySymbol(currency);

  const updatePrice = (item: MenuItem, value: string) => {
    setLastSaved(false);
    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, price_text: value, price_cents: null } : row,
      ),
    );
  };

  const toggleVisible = (item: MenuItem, checked: boolean) => {
    if (checked && item.type !== "section" && !itemHasPrice(item)) {
      setFormError(`Agrega un precio a "${item.name}" para poder activarlo.`);
      return;
    }
    setFormError("");
    setLastSaved(false);
    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? { ...row, visible: checked } : row)),
    );
  };

  const activateWithPrice = () => {
    setLastSaved(false);
    setItems((prev) =>
      prev.map((row) =>
        row.type === "section" || itemHasPrice(row)
          ? { ...row, visible: true }
          : row,
      ),
    );
  };

  const updateName = (item: MenuItem, name: string) => {
    setLastSaved(false);
    setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, name } : row)));
  };

  const handleSave = async () => {
    setFormError("");

    const resolved = items;

    const invalid = resolved.find(
      (item) => item.visible && item.type !== "section" && !itemHasPrice(item),
    );
    if (invalid) {
      setFormError(`Agrega un precio a "${invalid.name}" o desactívalo antes de guardar.`);
      return;
    }

    setSaving(true);
    try {
      await updateMenuValues(
        slide.id,
        resolved.map((item) => ({
          id: item.id,
          name: item.name,
          desc: item.desc || "",
          price_text: item.price_text,
          price_cents: item.price_cents ?? null,
          visible: item.visible,
        })),
      );
      setItems(resolved);
      setLastSaved(true);
      setMessage("Valores del formmenu guardados.");

      // Si el formmenu se insertó en un slide como imagen, refrescamos esa
      // imagen para que el TV reciba los precios nuevos.
      try {
        const refreshed = await refreshMenuSnapshots(slide.id);
        if (refreshed.updated > 0) {
          setMessage(
            `Valores guardados. Imágenes actualizadas en ${refreshed.updated} slide(s).`,
          );
        } else if (refreshed.failed > 0) {
          setMessage(
            "Valores guardados, pero no se pudieron actualizar algunas imágenes de slides.",
          );
        }
      } catch (refreshError) {
        console.error("No se pudieron refrescar las imágenes del formmenu", refreshError);
        setMessage(
          "Valores guardados, pero no se pudieron actualizar las imágenes de los slides.",
        );
      }
    } catch (err: any) {
      const errors = err.data?.errors?.items;
      setFormError(
        Array.isArray(errors) && errors.length > 0
          ? String(errors[0])
          : err.data?.message || "No se pudieron guardar los valores.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {formError && (
        <div className="rounded-lg border border-error-500/40 bg-error-500/10 px-4 py-3 text-sm text-error-600">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-theme-xs">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-content-primary">Editar valores</h3>
              <p className="text-xs text-content-muted">
                Solo se modifican nombres, precios y visibilidad. El diseño no cambia.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={activateWithPrice}>
              Activar todos con precio
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-content-muted">
                  <th className="px-2 py-2">Activo</th>
                  <th className="px-2 py-2">Producto</th>
                  <th className="px-2 py-2">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((item) => (
                  <tr key={item.id} className={item.visible ? "" : "bg-surface-sunken/40"}>
                    <td className="px-2 py-2 align-middle">
                      <Checkbox
                        checked={item.visible}
                        onChange={(checked) => toggleVisible(item, checked)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={item.name}
                        onChange={(event) => updateName(item, event.target.value)}
                        className={item.type === "section" ? "font-semibold" : ""}
                      />
                      {item.type === "section" && (
                        <span className="mt-1 block text-xs text-content-muted">Sección</span>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      {item.type === "section" ? (
                        <span className="text-sm text-content-muted">—</span>
                      ) : (
                        <input
                          type="text"
                          value={item.price_text || ""}
                          placeholder={`${symbol}0.00 · ${symbol}3/lb`}
                          onChange={(event) => updatePrice(item, event.target.value)}
                          className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-content-primary"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-content-muted">
              {lastSaved ? "Guardado correctamente." : "Los cambios se aplican al guardar."}
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/menus")}>
                Volver
              </Button>
              <Button type="button" onClick={handleSave} loading={saving}>
                Guardar precios
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 shadow-theme-xs">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-content-primary">Vista previa</h3>
            <div className="inline-flex rounded-lg border border-line p-1">
              {(["landscape", "portrait"] as MenuOrientation[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setOrientation(value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    orientation === value
                      ? "bg-brand-500 text-white"
                      : "text-content-secondary hover:bg-surface-hover"
                  }`}
                >
                  {value === "landscape" ? "Horizontal" : "Vertical"}
                </button>
              ))}
            </div>
          </div>

          <div className={orientation === "landscape" ? "w-full" : "mx-auto w-full max-w-[300px]"}>
            <MenuCanvas
              config={config}
              items={items}
              orientation={orientation}
              backgroundUrl={
                config[orientation].background.file_path
                  ? mediaUrl(config[orientation].background.file_path!)
                  : undefined
              }
              currency={currency}
              className={`rounded-xl border border-line ${
                orientation === "landscape" ? "aspect-video" : "aspect-[9/16]"
              }`}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default MenuValuesForm;
