"use client";

import React, {useState, useEffect} from "react";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import {useError} from "@/context/ErrorContext";
import Pagination from "../../../tables/Pagination";
import Select from "@/components/form/Select";
import config from "@/config/globalConfig";
import {MdDelete, MdEdit, MdCollections, MdPointOfSale, MdPlayArrow} from "react-icons/md";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import {ChevronDownIcon} from "@/icons";
import {useRouter} from "next/navigation";
import {useMessage} from "@/context/MessageContext";
import ActionModal from "@/components/ui/modal/ActionModal";
import {deleteSlides, fetchSlides} from "@/server/api/slides";
import {fetchDevices} from "@/server/api/devices";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import filterItems from "@/utils/filterItems";
import SearchInput from "@/components/tables/SearchInput";
import TableSkeleton from "@/components/tables/TableSkeleton";
import EmptyState from "@/components/tables/EmptyState";
import useDebounce from "@/hooks/useDebounce";
import { useT } from "@/i18n/I18nProvider";

const SlidesTable = () => {
    const router = useRouter();
    const tCommon = useT("common.buttons");
    const tTable = useT("common.table");
    const tHeaders = useT("common.table.headers");
    const tActions = useT("common.table.actions");
    const tFilters = useT("common.table.filters");
    const [slides, setSlides] = useState<any[]>([]);
    // Cantidad de dispositivos que están mostrando cada slide ahora mismo.
    const [activeSlideCounts, setActiveSlideCounts] = useState<Record<number, number>>({});
    const [selectedSlides, setSelectedSlides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const setError = useError().setError;
    const setMessage = useMessage().setMessage;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [data, devices] = await Promise.all([fetchSlides(), fetchDevices()]);
                // Los formmenu se gestionan en /menus; no se mezclan con el
                // listado de slides de medios.
                setSlides(
                    (Array.isArray(data) ? data : []).filter(
                        (slide: any) => slide.layout !== "menu"
                    )
                );

                const counts: Record<number, number> = {};
                (Array.isArray(devices) ? devices : []).forEach((device: any) => {
                    const id = device?.slide_id ?? device?.slide?.id;
                    if (id) counts[id] = (counts[id] || 0) + 1;
                });
                setActiveSlideCounts(counts);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error loading slides");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [ setSlides, setLoading, setError]);

    const toggleSelectSlides = (id: any) => {
        setSelectedSlides((prev) =>
            prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
        );
    };

    const deleteSelectedSlides = async () => {
        setIsWarningModalOpen(true);
    };

    const openWarningModal = (businessId: any) => {
        setSelectedSlides([businessId]);
        setIsWarningModalOpen(true);
    };

    const confirmDeleteSlides = async () => {
        if (selectedSlides.length > 0) {
            try {
                const response = await deleteSlides(selectedSlides);
                setSlides((prev) => prev.filter((b) => !selectedSlides.includes(b.id)));
                setSelectedSlides([]);
                setMessage(response.message);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error al eliminar negocio");
            } finally {
                setIsWarningModalOpen(false);
            }
        }
    };

    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const filteredBusinesses = filterItems(slides, debouncedSearchTerm);
    const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
    const paginatedBusinesses = filteredBusinesses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSettings = (slide: any) => {
        const slideId = typeof slide === "object" && slide !== null ? slide.id : slide;
        const layout = typeof slide === "object" && slide !== null ? slide.layout : undefined;
        if (layout === "menu") {
            router.push(`/slides/menu/${slideId}`);
            return;
        }
        router.push(`/slides/settings/${slideId}`);
    };

    const handleEdit = (slide: any) => {
        const slideId = typeof slide === "object" && slide !== null ? slide.id : slide;
        const layout = typeof slide === "object" && slide !== null ? slide.layout : undefined;
        if (layout === "menu") {
            router.push(`/slides/menu/${slideId}/values`);
            return;
        }
        router.push(`/slides/media-management/${slideId}`);
    };

    return (
        <>
            <ActionModal
                isOpen={isWarningModalOpen}
                onClose={() => setIsWarningModalOpen(false)}
                title={tTable("modals.delete.title")}
                message={tTable("modals.delete.message")}
                actions={[
                    {label: tCommon("cancel"), onClick: () => setIsWarningModalOpen(false)},
                    {label: tCommon("delete"), onClick: confirmDeleteSlides, variant: "primary"},
                ]}
            />
            <div>
                <div className="flex items-center justify-between mb-4">
                    {selectedSlides.length > 0 ? (
                        <div className={selectedSlides.length === 0 ? "hidden" : "flex"}>
                            <Tooltip content={tActions("delete")}>
                                <Button
                                    size="sm"
                                    onClick={deleteSelectedSlides}
                                    disabled={selectedSlides.length === 0}
                                    variant="danger"
                                >
                                    <MdDelete size={20}/>
                                </Button>
                            </Tooltip>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                onClick={() => { router.push("/slides/create"); }}
                                variant="primary"
                                size="sm"
                                className="mb-2 sm:mb-0 sm:w-auto"
                            >
                                <span className="hidden sm:block">{tCommon("add")}</span>
                                <span className="block sm:hidden">+</span>
                            </Button>
                            <Button
                                onClick={() => { router.push("/slides/menu/new"); }}
                                variant="outline"
                                size="sm"
                                className="mb-2 sm:mb-0 sm:w-auto"
                            >
                                Crear formmenu
                            </Button>
                        </div>
                    )}
                    <SearchInput
                        value={searchTerm}
                        onChange={(value) => {
                            setSearchTerm(value);
                            setCurrentPage(1);
                        }}
                        placeholder={tFilters("searchPlaceholder")}
                    />
                </div>
                {loading ? (
                    <TableSkeleton columns={5} />
                ) : paginatedBusinesses.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>
                                        <Checkbox
                                            checked={selectedSlides.length === slides.length && slides.length > 0}
                                            onChange={(checked) => setSelectedSlides(checked ? slides.map((b) => b.id) : [])}
                                        />
                                    </TableCell>
                                    <TableCell isHeader>{tHeaders("name")}</TableCell>
                                    <TableCell isHeader>{tHeaders("description")}</TableCell>
                                    <TableCell isHeader>{tHeaders("business")}</TableCell>
                                    <TableCell isHeader className="text-right sticky right-0 bg-surface-sunken z-10">{tHeaders("actions")}</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedBusinesses.map((slides: any) => (
                                    <TableRow key={slides.id}>
                                        <TableCell className="whitespace-nowrap">
                                            <Checkbox
                                                checked={selectedSlides.includes(slides.id)}
                                                onChange={() => toggleSelectSlides(slides.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-content-primary">
                                            <div className="flex items-center gap-2">
                                                <span>{slides.name}</span>
                                                {activeSlideCounts[slides.id] ? (
                                                    <Tooltip
                                                        content={tTable("activeOnDevices", {
                                                            count: activeSlideCounts[slides.id],
                                                        })}
                                                    >
                                                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-500/15 text-success-600 dark:text-success-400">
                                                            <MdPlayArrow size={14}/>
                                                        </span>
                                                    </Tooltip>
                                                ) : null}
                                                {slides.layout === "menu" && (
                                                    <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-500">
                                                        formmenu
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{slides.description}</TableCell>
                                        <TableCell className="whitespace-nowrap">{slides.business?.name || ""}</TableCell>
                                        <TableCell className="whitespace-nowrap relative sticky right-0 bg-surface z-10 group-hover:bg-surface-hover">
                                            <div className="flex gap-2 justify-end">
                                                {slides.layout === "menu" && (
                                                    <Tooltip content="Editar valores">
                                                        <Button size="sm" variant="primary" onClick={() => handleEdit(slides)}>
                                                            <MdPointOfSale size={18}/>
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                                {slides.layout !== "menu" && (
                                                    <Tooltip content={tActions("mediaManagement")}>
                                                        <Button size="sm" variant="primary" onClick={() => handleEdit(slides)}>
                                                            <MdCollections size={18}/>
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                                <Tooltip content={slides.layout === "menu" ? "Editar formmenu" : tActions("edit")}>
                                                    <Button size="sm" variant="outline" onClick={() => handleSettings(slides)}>
                                                        <MdEdit size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content={tActions("delete")}>
                                                    <Button size="sm" variant="danger" onClick={() => openWarningModal(slides.id)}>
                                                        <MdDelete size={18}/>
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 sm:gap-0">
                    <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-0 items-center">
                        <div className="flex-shrink-0 w-full sm:w-auto">
                            <div className="relative">
                                <Select
                                    options={config.itemsPerPageOptions.map((value) => ({
                                        value: value.toString(),
                                        label: tFilters("itemsPerPageOption", { n: value })
                                    }))}
                                    placeholder={tFilters("itemsPerPage")}
                                    defaultValue={config.defaultItemsPerPage.toString()}
                                    onChange={(value) => {
                                        setItemsPerPage(Number(value));
                                        setCurrentPage(1);
                                    }}
                                    className="w-full sm:w-auto"
                                />
                                <span
                                    className="absolute text-content-muted -translate-y-1/2 pointer-events-none right-3 top-1/2">
                                        <ChevronDownIcon/>
                                    </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end w-full sm:w-auto">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default SlidesTable;
