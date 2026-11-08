"use client";

import React, {useState, useEffect} from "react";
import JSZip from "jszip";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../ui/table";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import {useError} from "@/context/ErrorContext";
import { useMessage } from "@/context/MessageContext";
import { useRouter } from "next/navigation";
import Pagination from "../../../tables/Pagination";
import Select from "../../../form/Select";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import {MdDelete, MdEdit, MdInfo, MdAudioFile, MdVideoFile, MdGridView, MdViewList, MdPlaylistAdd, MdDownload} from "react-icons/md";
import {ChevronDownIcon} from "@/icons";
import config from "@/config/globalConfig";
import ActionModal from "@/components/ui/modal/ActionModal";
import filterItems from "@/utils/filterItems";
import SearchInput from "@/components/tables/SearchInput";
import TableSkeleton from "@/components/tables/TableSkeleton";
import EmptyState from "@/components/tables/EmptyState";
import useDebounce from "@/hooks/useDebounce";
import { fetchMedia, deleteMedia } from "@/server/api/media";
import { fetchSlides } from "@/server/api/slides";
import { createSlideMedias } from "@/server/api/slidesMedia";
import mediaUrl from "@/utils/files";
import Image from "@/components/ui/images/ExpandableImage";
import { deleteFileByDownloadURL, getFileNameFromURL} from "@/utils/firebaseStorage";
import { useT } from "@/i18n/I18nProvider";
import { Modal } from "@/components/ui/modal";

const MediaTable = () => {
    const tCommon = useT("common.buttons");
    const tTable = useT("common.table");
    const tHeaders = useT("common.table.headers");
    const tActions = useT("common.table.actions");
    const tFilters = useT("common.table.filters");
    const tViews = useT("pages.mediaLibrary.viewModes");
    const tLibrary = useT("pages.mediaLibrary");
    const router = useRouter();
    const [media, setMedia] = useState<any[]>([]);
    const [slides, setSlides] = useState<any[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState<"all" | "image" | "video" | "audio">("all");
    const [viewMode, setViewMode] = useState<"list" | "mosaic">("mosaic");
    const [mediaToAssign, setMediaToAssign] = useState<any | null>(null);
    const [selectedSlideId, setSelectedSlideId] = useState("");
    const [assignmentDuration, setAssignmentDuration] = useState("5");
    const [assignmentSaving, setAssignmentSaving] = useState(false);
    const [assignmentError, setAssignmentError] = useState("");
    const [downloadingMediaId, setDownloadingMediaId] = useState<number | null>(null);
    const [downloadingSelection, setDownloadingSelection] = useState(false);
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const setError = useError().setError;
    const setMessage = useMessage().setMessage;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mediaData, slideData] = await Promise.all([fetchMedia(), fetchSlides()]);
                setMedia(mediaData);
                setSlides(Array.isArray(slideData) ? slideData : []);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleSelectMedia = (id: any) => {
        setSelectedMedia((prev) =>
            prev.includes(id) ? prev.filter((mediaId) => mediaId !== id) : [...prev, id]
        );
    };

    const deleteSelectedMedia = async () => {
        setIsWarningModalOpen(true);
    };

    const openWarningModal = (mediaId: any) => {
        setSelectedMedia([mediaId]);
        setIsWarningModalOpen(true);
    };

    const confirmDeleteMedia = async () => {
        if (selectedMedia.length > 0) {
            try {
                // Capture the file URLs to delete from Firebase before mutating local state
                const urlsToDelete = media
                    .filter((item) => selectedMedia.includes(item.id))
                    .map((item) => item.file_path)
                    .filter(Boolean);

                const response = await deleteMedia(selectedMedia);

                // Update local state
                setMedia((prev) => prev.filter((item) => !selectedMedia.includes(item.id)));
                setSelectedMedia([]);
                setMessage(response.message);

                // Best-effort: remove files from Firebase Storage
                // Do this after successful API deletion and do not block UI on errors
                Promise.allSettled(
                    urlsToDelete.map((url: string) => deleteFileByDownloadURL(url))
                ).then(() => {/* noop */});
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error");
            } finally {
                setIsWarningModalOpen(false);
            }
        }
    };

    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const filteredMedia = filterItems(media, debouncedSearchTerm).filter(
        (item: any) => category === "all" || item.media_type === category
    );
    const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
    const paginatedMedia = filteredMedia.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleEdit = (mediaId: any) => {
        router.push(`/media-library/edit/${mediaId}`);
    };
    
    const handleViewDetails = (mediaId: any) => {
        router.push(`/media-library/details/${mediaId}`);
    };

    const downloadMediaItem = async (item: any) => {
        if (!item?.file_path) return;

        const fileName = getFileNameFromURL(item.file_path) || `adonplay-media-${item.id}`;
        setDownloadingMediaId(item.id);
        try {
            // Let the server stream the file with a Content-Disposition header.
            // This avoids CORS/blob limitations and works in browsers that
            // block programmatic downloads after an async fetch.
            const params = new URLSearchParams({
                url: item.file_path,
                name: fileName,
            });
            const link = document.createElement("a");
            link.href = `/api/download?${params.toString()}`;
            link.download = fileName;
            link.rel = "noopener";
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setError(tLibrary("downloadError"));
        } finally {
            setDownloadingMediaId(null);
        }
    };

    const triggerBlobDownload = (blob: Blob, fileName: string) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        // Revoking immediately can cancel the download in some browsers.
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    };

    const getUniqueFileName = (fileName: string, usedNames: Set<string>) => {
        if (!usedNames.has(fileName)) {
            usedNames.add(fileName);
            return fileName;
        }

        const dot = fileName.lastIndexOf(".");
        const base = dot > 0 ? fileName.slice(0, dot) : fileName;
        const extension = dot > 0 ? fileName.slice(dot) : "";
        let index = 2;
        let candidate = `${base} (${index})${extension}`;
        while (usedNames.has(candidate)) {
            index += 1;
            candidate = `${base} (${index})${extension}`;
        }
        usedNames.add(candidate);
        return candidate;
    };

    const downloadSelectedMedia = async () => {
        const selectedItems = media.filter((item) => selectedMedia.includes(item.id));
        if (selectedItems.length === 0) return;
        if (selectedItems.length === 1) {
            await downloadMediaItem(selectedItems[0]);
            return;
        }

        setDownloadingSelection(true);
        try {
            const zip = new JSZip();
            const usedNames = new Set<string>();
            const failedFiles: string[] = [];

            for (const item of selectedItems) {
                const originalName = getFileNameFromURL(item.file_path) || `adonplay-media-${item.id}`;
                if (!item?.file_path) {
                    failedFiles.push(originalName);
                    continue;
                }

                try {
                    const params = new URLSearchParams({
                        url: item.file_path,
                        name: originalName,
                    });
                    const response = await fetch(`/api/download?${params.toString()}`);
                    if (!response.ok) throw new Error(`Download failed: ${item.id}`);

                    const blob = await response.blob();
                    if (blob.size === 0) throw new Error(`Empty file: ${item.id}`);
                    zip.file(getUniqueFileName(originalName, usedNames), blob);
                } catch (error) {
                    // Skip the broken file instead of failing the whole archive.
                    console.error("Media download failed", item.file_path, error);
                    failedFiles.push(originalName);
                }
            }

            // Nothing could be downloaded: report the failure and stop.
            if (usedNames.size === 0) {
                setError(tLibrary("downloadError"));
                return;
            }

            const archive = await zip.generateAsync({type: "blob"});
            triggerBlobDownload(archive, `adonplay-media-${new Date().toISOString().slice(0, 10)}.zip`);

            if (failedFiles.length > 0) {
                setError(tLibrary("downloadPartialError", {n: failedFiles.length}));
            } else {
                setMessage(tLibrary("downloadZipSuccess"));
            }
        } catch (error) {
            setError(tLibrary("downloadError"));
        } finally {
            setDownloadingSelection(false);
        }
    };

    const openAssignModal = (item: any) => {
        setMediaToAssign(item);
        setSelectedSlideId("");
        setAssignmentDuration("5");
        setAssignmentError("");
    };

    const closeAssignModal = () => {
        if (!assignmentSaving) setMediaToAssign(null);
    };

    const assignMediaToSlide = async () => {
        if (!mediaToAssign || !selectedSlideId) {
            setAssignmentError(tLibrary("assignValidation"));
            return;
        }

        const duration = Number(assignmentDuration);
        if (!Number.isFinite(duration) || duration <= 0) {
            setAssignmentError(tLibrary("durationValidation"));
            return;
        }

        setAssignmentSaving(true);
        setAssignmentError("");
        try {
            await createSlideMedias({
                slide_id: Number(selectedSlideId),
                media_id: mediaToAssign.id,
                duration,
            });
            setMessage(tLibrary("assignSuccess"));
            setMediaToAssign(null);
        } catch (err: any) {
            const errors = err.data?.errors;
            setAssignmentError(Array.isArray(errors) ? errors.join(" · ") : err.data?.error || err.message || tLibrary("assignError"));
        } finally {
            setAssignmentSaving(false);
        }
    };

    return (
        <>
            <ActionModal
                isOpen={isWarningModalOpen}
                onClose={() => setIsWarningModalOpen(false)}
                title={tTable("modals.delete.title")}
                message={tTable("modals.delete.message")}
                actions={[
                    { label: tCommon("cancel"), onClick: () => setIsWarningModalOpen(false) },
                    { label: tCommon("delete"), onClick: confirmDeleteMedia, variant: "primary" },
                ]}
            />
            <Modal isOpen={Boolean(mediaToAssign)} onClose={closeAssignModal} className="max-w-md p-6">
                <div className="space-y-5">
                    <div>
                        <h2 className="text-lg font-semibold text-content-primary">{tLibrary("assignTitle")}</h2>
                        <p className="mt-1 truncate text-sm text-content-muted" title={mediaToAssign ? (getFileNameFromURL(mediaToAssign.file_path) || `Media #${mediaToAssign.id}`) : ""}>
                            {mediaToAssign ? (getFileNameFromURL(mediaToAssign.file_path) || `Media #${mediaToAssign.id}`) : ""}
                        </p>
                    </div>
                    {assignmentError && (
                        <div className="rounded-lg border border-error-500/30 bg-error-500/10 px-3 py-2 text-sm text-error-500">
                            {assignmentError}
                        </div>
                    )}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-content-secondary">{tLibrary("selectSlide")}</label>
                        <Select
                            options={slides
                                .filter((slide) => slide.layout !== "menu")
                                .map((slide) => ({ value: String(slide.id), label: slide.name || `#${slide.id}` }))}
                            placeholder={tLibrary("selectSlidePlaceholder")}
                            onChange={setSelectedSlideId}
                            disabled={assignmentSaving}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-content-secondary">{tLibrary("duration")}</label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={assignmentDuration}
                            onChange={(event) => setAssignmentDuration(event.target.value)}
                            disabled={assignmentSaving}
                            className="h-11 w-full rounded-lg border border-line-strong bg-surface px-4 text-sm text-content-primary outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-500/10"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={closeAssignModal} disabled={assignmentSaving}>
                            {tCommon("cancel")}
                        </Button>
                        <Button type="button" variant="primary" onClick={assignMediaToSlide} disabled={assignmentSaving || !selectedSlideId}>
                            {assignmentSaving ? tLibrary("assigning") : tLibrary("assignButton")}
                        </Button>
                    </div>
                </div>
            </Modal>
            <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    { selectedMedia.length > 0 ? (
                        <div className="flex items-center gap-2">
                            <Tooltip content={tActions("delete")}>
                                <Button
                                    size="sm"
                                    onClick={deleteSelectedMedia}
                                    disabled={selectedMedia.length === 0}
                                    variant="danger"
                                >
                                    <MdDelete size={20}/>
                                </Button>
                            </Tooltip>
                            <Tooltip content={selectedMedia.length > 1 ? tLibrary("downloadZip") : tLibrary("download")}>
                                <Button
                                    size="sm"
                                    onClick={downloadSelectedMedia}
                                    disabled={downloadingSelection || downloadingMediaId !== null}
                                    variant="outline"
                                >
                                    <MdDownload size={20}/>
                                    <span className="hidden sm:inline">
                                        {downloadingSelection ? tLibrary("downloadingZip") : selectedMedia.length > 1 ? tLibrary("downloadZip") : tLibrary("download")}
                                    </span>
                                </Button>
                            </Tooltip>
                        </div>
                    ) : (
                        <Button
                            onClick={() => router.push(`/media-library/create`)}
                            variant="primary"
                            size="sm"
                            className="mb-2 sm:mb-0 sm:w-auto"
                        >
                            <span className="hidden sm:block">{tCommon("add")}</span>
                            <span className="block sm:hidden">+</span>
                        </Button>
                    )}
                    <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                        <Select
                            options={[
                                {value: "all", label: tLibrary("categories.all")},
                                {value: "image", label: tLibrary("categories.image")},
                                {value: "video", label: tLibrary("categories.video")},
                                {value: "audio", label: tLibrary("categories.audio")},
                            ]}
                            placeholder={tLibrary("category")}
                            defaultValue={category}
                            onChange={(value) => {
                                setCategory(value as "all" | "image" | "video" | "audio");
                                setCurrentPage(1);
                            }}
                            className="w-full sm:w-36"
                        />
                        <div className="flex items-center rounded-lg border border-line bg-surface-sunken p-1" role="group" aria-label="Media view">
                            <button
                                type="button"
                                aria-label={tViews("list")}
                                aria-pressed={viewMode === "list"}
                                onClick={() => setViewMode("list")}
                                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === "list" ? "bg-surface text-content-primary shadow-sm" : "text-content-muted hover:text-content-primary"}`}
                            >
                                <MdViewList size={17} />
                                <span className="hidden sm:inline">{tViews("list")}</span>
                            </button>
                            <button
                                type="button"
                                aria-label={tViews("mosaic")}
                                aria-pressed={viewMode === "mosaic"}
                                onClick={() => setViewMode("mosaic")}
                                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === "mosaic" ? "bg-surface text-content-primary shadow-sm" : "text-content-muted hover:text-content-primary"}`}
                            >
                                <MdGridView size={17} />
                                <span className="hidden sm:inline">{tViews("mosaic")}</span>
                            </button>
                        </div>
                        <SearchInput
                            value={searchTerm}
                            onChange={(value) => {
                                setSearchTerm(value);
                                setCurrentPage(1);
                            }}
                            placeholder={tFilters("searchPlaceholder")}
                        />
                    </div>
                </div>
                {loading ? (
                    <TableSkeleton columns={4} />
                ) : paginatedMedia.length === 0 ? (
                    <EmptyState />
                ) : (
                    viewMode === "mosaic" ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {paginatedMedia.map((item: any) => (
                                <article key={item.id} className="group overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-brand-500/50">
                                    <div className="relative aspect-[16/10] overflow-hidden bg-surface-sunken">
                                        <div className="absolute left-3 top-3 z-10 rounded-md bg-surface/90 p-1 shadow-sm">
                                            <Checkbox
                                                checked={selectedMedia.includes(item.id)}
                                                onChange={() => toggleSelectMedia(item.id)}
                                            />
                                        </div>
                                        {item.media_type === "image" ? (
                                            <div className="flex h-full w-full items-center justify-center bg-surface-sunken p-2">
                                                <Image
                                                    src={mediaUrl(item.file_path)}
                                                    alt={getFileNameFromURL(item.file_path) || `Media #${item.id}`}
                                                    containerClassName="relative h-full w-full"
                                                    className="h-full w-full object-contain"
                                                    width={config.thumbnailSizes.width}
                                                    height={config.thumbnailSizes.height}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-content-muted">
                                                {item.media_type === "video" ? <MdVideoFile size={48} className="text-blue-light-500" /> : <MdAudioFile size={48} className="text-blue-light-500" />}
                                                <span className="text-xs font-medium">{item.media_type === "video" ? tHeaders("video") : tHeaders("audio")}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-end gap-1.5 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-8 transition-transform group-hover:translate-y-0 group-focus-within:translate-y-0">
                                            <Tooltip content={tActions("view")}>
                                                <Button onClick={() => handleViewDetails(item.id)} variant="primary" size="sm">
                                                    <MdInfo size={18}/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content={tActions("edit")}>
                                                <Button onClick={() => handleEdit(item.id)} variant="outline" size="sm">
                                                    <MdEdit size={18}/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content={tActions("delete")}>
                                                <Button onClick={() => openWarningModal(item.id)} variant="danger" size="sm">
                                                    <MdDelete size={18}/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content={tLibrary("download") }>
                                                <Button
                                                    onClick={() => downloadMediaItem(item)}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={downloadingMediaId === item.id}
                                                >
                                                    <MdDownload size={18}/>
                                                    <span className="sr-only">{tLibrary("download")}</span>
                                                </Button>
                                            </Tooltip>
                                            {item.media_type !== "audio" && (
                                                <Tooltip content={tLibrary("assignToSlide")}>
                                                    <Button onClick={() => openAssignModal(item)} variant="outline" size="sm">
                                                        <MdPlaylistAdd size={18}/>
                                                        <span className="sr-only">{tLibrary("assignToSlide")}</span>
                                                    </Button>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </div>
                                    <div className="min-w-0 p-3">
                                        <p className="truncate text-sm font-medium text-content-primary" title={getFileNameFromURL(item.file_path) || `Media #${item.id}`}>
                                            {getFileNameFromURL(item.file_path) || `Media #${item.id}`}
                                        </p>
                                        <p className="mt-1 text-xs capitalize text-content-muted">{item.media_type}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>
                                        <Checkbox
                                            checked={selectedMedia.length === media.length}
                                            onChange={(checked) =>
                                                setSelectedMedia(checked ? media.map((item) => item.id) : [])
                                            }
                                        />
                                    </TableCell>
                                    <TableCell isHeader>{tHeaders("file")}</TableCell>
                                    <TableCell isHeader>{tHeaders("name")}</TableCell>
                                    <TableCell isHeader className="text-right sticky right-0 bg-surface-sunken z-10">{tHeaders("actions")}</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedMedia.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="whitespace-nowrap">
                                            <Checkbox
                                                checked={selectedMedia.includes(item.id)}
                                                onChange={() => toggleSelectMedia(item.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {item.media_type === "image" ? (
                                                <div className="flex h-16 w-28 items-center justify-center overflow-hidden rounded-lg bg-surface-sunken p-1">
                                                    <Image
                                                        src={mediaUrl(item.file_path)}
                                                        alt="Image preview"
                                                        containerClassName="relative h-full w-full"
                                                        className="h-full w-full object-contain"
                                                        width={config.thumbnailSizes.width}
                                                        height={config.thumbnailSizes.height}
                                                    />
                                                </div>
                                            ) : item.media_type === "video" ? (
                                                <div className="flex items-center">
                                                    <MdVideoFile size={24} className="text-blue-light-500 dark:text-blue-light-400 mr-2" />
                                                    <span>{tHeaders("video")}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <MdAudioFile size={24} className="text-blue-light-500 dark:text-blue-light-400 mr-2" />
                                                    <span>{tHeaders("audio")}</span>
                                                </div>
                                            )
                                            }
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{ getFileNameFromURL(item.file_path) }</TableCell>
                                        <TableCell className="whitespace-nowrap relative sticky right-0 bg-surface z-10 group-hover:bg-surface-hover">
                                            <div className="flex gap-2 justify-end">
                                                <Tooltip content={tActions("view")}>
                                                    <Button
                                                        onClick={() => handleViewDetails(item.id)}
                                                        variant="primary"
                                                        size="sm"
                                                    >
                                                        <MdInfo size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content={tActions("edit")}>
                                                    <Button
                                                        onClick={() => handleEdit(item.id)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <MdEdit size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content={tActions("delete")}>
                                                    <Button
                                                        onClick={() => openWarningModal(item.id)}
                                                        variant="danger"
                                                        size="sm"
                                                    >
                                                        <MdDelete size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content={tLibrary("download") }>
                                                    <Button
                                                        onClick={() => downloadMediaItem(item)}
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={downloadingMediaId === item.id}
                                                    >
                                                        <MdDownload size={18}/>
                                                        <span className="sr-only">{tLibrary("download")}</span>
                                                    </Button>
                                                </Tooltip>
                                                {item.media_type !== "audio" && (
                                                    <Tooltip content={tLibrary("assignToSlide")}>
                                                        <Button
                                                            onClick={() => openAssignModal(item)}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <MdPlaylistAdd size={18}/>
                                                            <span className="sr-only">{tLibrary("assignToSlide")}</span>
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    )
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
                                <span className="absolute text-content-muted -translate-y-1/2 pointer-events-none right-3 top-1/2">
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

export default MediaTable;
