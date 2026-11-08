"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import ActionModal from "@/components/ui/modal/ActionModal";
import { Modal } from "@/components/ui/modal";
import Select from "@/components/form/Select";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Pagination from "../../tables/Pagination";
import SearchInput from "@/components/tables/SearchInput";
import TableSkeleton from "@/components/tables/TableSkeleton";
import EmptyState from "@/components/tables/EmptyState";
import useDebounce from "@/hooks/useDebounce";
import filterItems from "@/utils/filterItems";
import { useError } from "@/context/ErrorContext";
import { useMessage } from "@/context/MessageContext";
import { deleteSlides, fetchSlides } from "@/server/api/slides";
import { fetchDevices } from "@/server/api/devices";
import { createSlideMedias } from "@/server/api/slidesMedia";
import { createMedia, deleteMedia } from "@/server/api/media";
import MenuCanvas from "@/components/app/menus/MenuCanvas";
import {
  MenuOrientation,
  STAGE_SIZES,
  mergeMenuConfig,
  normalizeMenuItems,
} from "@/components/app/menus/menuTypes";
import { captureMenuImage } from "@/utils/menuSnapshot";
import { uploadFileToStorage } from "@/utils/firebaseStorage";
import mediaUrl from "@/utils/files";
import { MdDelete, MdEdit, MdPlaylistAdd, MdPlayArrow, MdPointOfSale } from "react-icons/md";

const FormMenuTable = () => {
  const router = useRouter();
  const setError = useError().setError;
  const setMessage = useMessage().setMessage;

  const [slides, setSlides] = useState<any[]>([]);
  const [allSlides, setAllSlides] = useState<any[]>([]);
  // Cantidad de dispositivos que están mostrando cada formmenu ahora mismo.
  const [activeMenuCounts, setActiveMenuCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [menuToAssign, setMenuToAssign] = useState<any | null>(null);
  const [targetSlideId, setTargetSlideId] = useState("");
  const [assignDuration, setAssignDuration] = useState("10");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignOrientation, setAssignOrientation] = useState<MenuOrientation>("landscape");
  const snapshotRef = useRef<HTMLDivElement>(null);

  // El formmenu se exporta a imagen antes de insertarlo en el slide: los slides
  // solo reproducen medios (imagen/video), no formmenu interactivos.
  const assignConfig = useMemo(
    () => mergeMenuConfig(menuToAssign?.menu?.config),
    [menuToAssign]
  );
  const assignItems = useMemo(
    () => normalizeMenuItems(menuToAssign?.menu?.items),
    [menuToAssign]
  );
  const assignStage = STAGE_SIZES[assignOrientation];
  const assignBackgroundUrl = useMemo(() => {
    const filePath = assignConfig[assignOrientation]?.background?.file_path;
    return filePath ? mediaUrl(filePath) : "";
  }, [assignConfig, assignOrientation]);

  const load = async () => {
    try {
      const [data, devices] = await Promise.all([fetchSlides(), fetchDevices()]);
      const all = Array.isArray(data) ? data : [];
      setAllSlides(all);
      setSlides(all.filter((slide: any) => slide.layout === "menu"));

      const counts: Record<number, number> = {};
      (Array.isArray(devices) ? devices : []).forEach((device: any) => {
        const id = device?.slide_id ?? device?.slide?.id;
        if (id) counts[id] = (counts[id] || 0) + 1;
      });
      setActiveMenuCounts(counts);
    } catch (err: any) {
      setError(err.data?.message || err.message || "Error al cargar los formmenu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedSearch = useDebounce(searchTerm, 250);
  const filtered = filterItems(slides, debouncedSearch);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await deleteSlides([deleteTarget]);
      setSlides((prev) => prev.filter((slide) => slide.id !== deleteTarget));
      setMessage(response.message || "formmenu eliminado.");
    } catch (err: any) {
      setError(err.data?.message || err.message || "No se pudo eliminar el formmenu.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const openAssignModal = (menu: any) => {
    setMenuToAssign(menu);
    setTargetSlideId("");
    setAssignDuration("10");
    setAssignOrientation("landscape");
    setAssignError("");
  };

  const closeAssignModal = () => {
    if (assigning) return;
    setMenuToAssign(null);
    setTargetSlideId("");
    setAssignError("");
  };

  // Solo se puede añadir el formmenu a slides del mismo negocio. Los formmenu ya no
  // se ofrecen como destino porque no son slides por sí mismos.
  const availableSlides = allSlides.filter(
    (item) =>
      item.layout !== "menu" &&
      (!menuToAssign?.business_id || item.business_id === menuToAssign.business_id)
  );

  const assignMenuToSlide = async () => {
    if (!menuToAssign || !targetSlideId) return;

    const duration = Number(assignDuration);
    if (!Number.isFinite(duration) || duration <= 0) {
      setAssignError("La duración debe ser mayor que 0.");
      return;
    }

    const snapshotElement = snapshotRef.current;
    if (!snapshotElement) {
      setAssignError("No se pudo preparar el formmenu. Inténtalo de nuevo.");
      return;
    }

    setAssigning(true);
    setAssignError("");
    let createdMediaId: number | null = null;
    try {
      // 1. Renderiza el formmenu a imagen.
      const image = await captureMenuImage(snapshotElement);
      const file = new File([image], `menu-${menuToAssign.id}-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // 2. Súbela como media del sistema.
      const uploaded = await uploadFileToStorage(file, "media/image");
      const media = await createMedia({
        media_type: "image",
        file_path: uploaded.downloadURL,
        // Vincula la imagen con el formmenu para poder regenerarla cuando se
        // editen precios o el diseño.
        menu_slide_id: menuToAssign.id,
      });

      if (!media?.id) {
        throw new Error("No se pudo registrar la imagen del formmenu.");
      }
      createdMediaId = media.id;

      // 3. Insértala en el slide destino con la duración indicada.
      await createSlideMedias({
        slide_id: Number(targetSlideId),
        media_id: media.id,
        duration,
      });

      setMessage("formmenu convertido a imagen y añadido al slide.");
      setMenuToAssign(null);
      setTargetSlideId("");
    } catch (err: any) {
      // Si la imagen llegó a registrarse pero no se pudo insertar en el slide,
      // se elimina para no dejar un medio huérfano en la biblioteca.
      if (createdMediaId) {
        deleteMedia([createdMediaId]).catch(() => {});
      }

      const errors = err.data?.errors;
      setAssignError(
        Array.isArray(errors)
          ? errors.join(" · ")
          : typeof errors === "object" && errors !== null
            ? Object.values(errors).flat().join(" · ")
            : err.data?.error || err.data?.message || err.message || "No se pudo convertir el formmenu y añadirlo al slide."
      );
    } finally {
      setAssigning(false);
    }
  };

  return (
    <>
      <ActionModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar formmenu"
        message="Esta acción eliminará el formmenu. Las imágenes ya añadidas a los slides se conservarán. ¿Deseas continuar?"
        actions={[
          { label: "Cancelar", onClick: () => setDeleteTarget(null) },
          { label: "Eliminar", onClick: confirmDelete, variant: "primary" },
        ]}
      />

      <Modal isOpen={Boolean(menuToAssign)} onClose={closeAssignModal} className="max-w-md p-6">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-content-primary">Añadir formmenu a un slide</h2>
            <p className="mt-1 truncate text-sm text-content-muted" title={menuToAssign?.name || ""}>
              {menuToAssign?.name || ""}
            </p>
            <p className="mt-1 text-xs text-content-muted">
              El formmenu se convertirá en una imagen para poder reproducirse dentro del slide.
              Si después editas precios o productos, la imagen se actualizará automáticamente
              al guardar el formmenu.
            </p>
          </div>
          {assignError && (
            <div className="rounded-lg border border-error-500/30 bg-error-500/10 px-3 py-2 text-sm text-error-500">
              {assignError}
            </div>
          )}
          <div
            className={`overflow-hidden rounded-xl border border-line ${
              assignOrientation === "landscape"
                ? "aspect-video"
                : "mx-auto aspect-[9/16] w-40"
            }`}
          >
            <MenuCanvas
              config={assignConfig}
              items={assignItems}
              orientation={assignOrientation}
              backgroundUrl={assignBackgroundUrl}
              currency={menuToAssign?.business?.currency || "MXN"}
              className="h-full w-full"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content-secondary">Orientación</label>
            <Select
              options={[
                { value: "landscape", label: "Horizontal" },
                { value: "portrait", label: "Vertical" },
              ]}
              defaultValue={assignOrientation}
              onChange={(value) => setAssignOrientation(value as MenuOrientation)}
              disabled={assigning}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content-secondary">Slide destino</label>
            <Select
              options={availableSlides.map((item) => ({
                value: String(item.id),
                label: item.name || `#${item.id}`,
              }))}
              placeholder={availableSlides.length > 0 ? "Selecciona un slide" : "No hay slides disponibles"}
              onChange={setTargetSlideId}
              disabled={assigning || availableSlides.length === 0}
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content-secondary">Duración (segundos)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={assignDuration}
              onChange={(event) => setAssignDuration(event.target.value)}
              disabled={assigning}
              className="h-11 w-full rounded-lg border border-line-strong bg-surface px-4 text-sm text-content-primary outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-500/10"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeAssignModal} disabled={assigning}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={assignMenuToSlide}
              disabled={assigning || !targetSlideId}
            >
              {assigning ? "Añadiendo..." : "Añadir"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lienzo oculto a tamaño real: es el que se exporta como imagen. */}
      {menuToAssign && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: -30000,
            top: 0,
            width: assignStage.width,
            height: assignStage.height,
            pointerEvents: "none",
          }}
        >
          <div ref={snapshotRef} style={{ width: "100%", height: "100%" }}>
            <MenuCanvas
              config={assignConfig}
              items={assignItems}
              orientation={assignOrientation}
              backgroundUrl={assignBackgroundUrl}
              currency={menuToAssign?.business?.currency || "MXN"}
              snapshot
              className="h-full w-full"
            />
          </div>
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button onClick={() => router.push("/slides/menu/new")}>Crear formmenu</Button>
          <SearchInput
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            placeholder="Buscar formmenu..."
          />
        </div>

        {loading ? (
          <TableSkeleton columns={4} />
        ) : paginated.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Nombre</TableCell>
                  <TableCell isHeader>Negocio</TableCell>
                  <TableCell isHeader>Productos</TableCell>
                  <TableCell isHeader className="text-right">Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((slide: any) => {
                  const items = Array.isArray(slide.menu?.items) ? slide.menu.items : [];
                  const products = items.filter((item: any) => item.type !== "section");
                  const active = products.filter((item: any) => item.visible);

                  return (
                    <TableRow key={slide.id}>
                      <TableCell className="whitespace-nowrap text-content-primary">
                        <div className="flex items-center gap-2">
                          <span>{slide.name}</span>
                          {activeMenuCounts[slide.id] ? (
                            <Tooltip
                              content={`Activo en ${activeMenuCounts[slide.id]} dispositivo(s)`}
                            >
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-500/15 text-success-600 dark:text-success-400">
                                <MdPlayArrow size={14} />
                              </span>
                            </Tooltip>
                          ) : null}
                          <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-500">
                            formmenu
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{slide.business?.name || ""}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {active.length} activos / {products.length}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Tooltip content="Editar precios y disponibilidad">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => router.push(`/slides/menu/${slide.id}/values`)}
                            >
                              <MdPointOfSale size={18} />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Editar diseño">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/slides/menu/${slide.id}`)}
                            >
                              <MdEdit size={18} />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Añadir a un slide">
                            <Button size="sm" variant="outline" onClick={() => openAssignModal(slide)}>
                              <MdPlaylistAdd size={18} />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Eliminar">
                            <Button size="sm" variant="danger" onClick={() => setDeleteTarget(slide.id)}>
                              <MdDelete size={18} />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </>
  );
};

export default FormMenuTable;
