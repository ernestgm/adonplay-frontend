"use client";

import React, {useState, useEffect} from "react";
import NextImage from "next/image";
import {useRouter} from "next/navigation";
import {MdCheck, MdClose, MdOutlinePermMedia, MdPlayArrow} from "react-icons/md";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import {useError} from "@/context/ErrorContext";
import {useMessage} from "@/context/MessageContext";
import {createSlideMedias, updateSlideMedias} from "@/server/api/slidesMedia";
import {fetchAudioMediaExcepted, fetchMediaExcepted, getMedia} from "@/server/api/media";
import {fetchQrCode} from "@/server/api/qrcodes";
import config from "@/config/globalConfig";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import {ChevronDownIcon} from "@/icons";
import ComponentCard from "@/components/common/ComponentCard";
import PositionExample from "@/components/common/PositionExample";
// import FileInput from "@/components/form/input/FileInput";
import {QRCodeCanvas} from "qrcode.react";
import handleDownloadQr from "@/utils/qrCode";
import { Modal } from "@/components/ui/modal";
import mediaUrl from "@/utils/files";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Checkbox from "@/components/form/input/Checkbox";
import SearchInput from "@/components/tables/SearchInput";
import Pagination from "@/components/tables/Pagination";
import filterItems from "@/utils/filterItems";
import Image from "@/components/ui/images/ExpandableImage";
import { useT } from "@/i18n/I18nProvider";
import {getFileNameFromURL} from "@/utils/firebaseStorage";


const descriptionPositions = config.positions;
const textSizes = config.text_sizes;

interface MediaFormProps {
    slideMedia?: any;
    slideId: any;
}

const SlideMediaForm: React.FC<MediaFormProps> = ({slideMedia, slideId}) => {
    const t = useT("forms.slideMedia");
    const tCommon = useT("common.buttons");
    const tFilters = useT("common.table.filters");
    const tTableHeaders = useT("common.table.headers");
    const tTableStates = useT("common.table.states");
    const tQrButtons = useT("forms.qrcodes.buttons");
    const isEditing = !!slideMedia?.id;
    const [form, setForm] = useState({
        slide_id: slideId,
        media_id: slideMedia?.media_id || "",
        duration: slideMedia?.duration || "5",
        audio_media_id: slideMedia?.audio_media_id || "",
        qr_id: slideMedia?.qr_id || "",
        description: slideMedia?.description || "",
        text_size: slideMedia?.text_size || "md",
        description_position: slideMedia?.description_position || "bc",
    });

    // State for media selection
    const [allMedia, setAllMedia] = useState<any[]>([]);
    const [allAudios, setAllAudios] = useState<any[]>([]);

    // Multi-selection of media (images and videos)
    const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>(
        slideMedia?.media_id ? [slideMedia.media_id.toString()] : []
    );

    // Map of mediaId -> audioId (both as string)
    const [mediaAudioMap, setMediaAudioMap] = useState<Record<string, string>>(() => {
        if (slideMedia?.audio_media_id && slideMedia?.media_id) {
            return { [slideMedia.media_id.toString()]: slideMedia.audio_media_id.toString() };
        }
        return {};
    });

    const [audioUsed, setAudioUsed] = useState(slideMedia?.audio_media != null);
    const [mediaSearchTerm, setMediaSearchTerm] = useState("");
    const [currentMediaPage, setCurrentMediaPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [showMediaSelector, setShowMediaSelector] = useState(false);
    // Per-image audio assignment modal
    const [showAssignAudioModal, setShowAssignAudioModal] = useState(false);
    const [audioModalMediaId, setAudioModalMediaId] = useState<string | null>(null);
    const [audioModalSelectedId, setAudioModalSelectedId] = useState<string>("");

    // State for QR codes
    const [qrCodes, setQrCodes] = useState<any[]>([]);
    const [selectedQrId, setSelectedQrId] = useState(slideMedia?.qr_id || "");
    const [selectedQr, setSelectedQr] = useState<any>(null);
    const [qrSearchTerm, setQrSearchTerm] = useState("");
    const [showQrSelector, setShowQrSelector] = useState(false);

    // Removed upload states (no longer supported by requirement)
    const [fileError, setFileError] = useState("");
    const [loading, setLoading] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

    const setError = useError().setError;
    const setMessage = useMessage().setMessage;
    const router = useRouter();

    // Fetch all media and QR codes when component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch media
                let mediaData = await fetchMediaExcepted(slideId);
                // When editing, the current media is excluded by the endpoint. Ensure it is available.
                if (isEditing && slideMedia?.media_id) {
                    const exists = mediaData.some((m: any) => m.id === parseInt(slideMedia.media_id));
                    if (!exists) {
                        try {
                            const currentMedia = await getMedia(slideMedia.media_id);
                            if (currentMedia) {
                                mediaData = [currentMedia, ...mediaData];
                            }
                        } catch (e) {
                            // ignore if fails
                        }
                    }
                }
                setAllMedia(mediaData);

                const mediaAudioData = await fetchAudioMediaExcepted(slideId);
                setAllAudios(mediaAudioData);

                // Fetch QR codes
                const qrData = await fetchQrCode();
                setQrCodes(qrData);

                // Set selected QR if it exists
                if (slideMedia?.qr_id) {
                    const qr = qrData.find((q: { id: number; }) => q.id === parseInt(slideMedia.qr_id));
                    setSelectedQr(qr);
                }

                // Selected media/audio are handled by selectedMediaIds and mediaAudioMap

            } catch (err: any) {
                setError(err.data?.message || err.message || t("errors.loadMedia"));
            }
        };
        fetchData();
    }, []);

    // Keep a small preview if exactly one media is selected
    useEffect(() => {
        if (selectedMediaIds.length === 1) {
            const media = allMedia.find(m => m.id === parseInt(selectedMediaIds[0]));
            if (media && media.media_type === "image") {
                setImagePreviewUrl(mediaUrl(media.file_path));
            } else {
                setImagePreviewUrl(null);
            }
        } else {
            setImagePreviewUrl(null);
        }
    }, [selectedMediaIds, allMedia]);

    // Clean up preview URLs when component unmounts
    useEffect(() => {
        return () => {
            if (imagePreviewUrl && !imagePreviewUrl.startsWith('http')) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
            if (audioPreviewUrl && !audioPreviewUrl.startsWith('http')) {
                URL.revokeObjectURL(audioPreviewUrl);
            }
        };
    }, [imagePreviewUrl, audioPreviewUrl]);

    const handleChange = (e: any) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleDescriptionChange = (value: any) => {
        setForm({...form, description: value});
    };

    const handlePositionChange = (value: any) => {
        setForm({...form, description_position: value});
    };

    const handleTextSizeChange = (value: any) => {
        setForm({...form, text_size: value});
    };

    const clearAudioFile = () => {
        // Clear all audio assignments
        setMediaAudioMap({});
        setAudioPreviewUrl(null);
        setAudioUsed(false);
    };

    const clearQr = () => {
        setSelectedQrId(null);
        setForm({...form, qr_id: ''});
        setSelectedQr(null);
        setShowQrSelector(false);
    };

    const handleSelectQr = (qrId: string) => {
        setSelectedQrId(qrId.toString());
        setForm({...form, qr_id: qrId.toString()});

        // Find the selected QR code
        const qr = qrCodes.find(q => q.id === parseInt(qrId));
        setSelectedQr(qr);

        setShowQrSelector(false);
    };

    // Toggle selection for a media id
    const toggleSelectMedia = (mediaId: number) => {
        const id = mediaId.toString();
        if (isEditing) {
            // single selection in edit mode
            setSelectedMediaIds([id]);
            setMediaAudioMap((prev) => (prev[id] ? { [id]: prev[id] } : {}));
            setAudioUsed(Boolean(mediaAudioMap[id]));
            return;
        }

        if (selectedMediaIds.includes(id)) {
            // Deseleccionar: sin efectos secundarios dentro del updater
            setSelectedMediaIds((prev) => prev.filter((m) => m !== id));
            const rest = { ...mediaAudioMap };
            delete rest[id];
            setMediaAudioMap(rest);
            setAudioUsed(Object.keys(rest).length > 0);
        } else {
            setSelectedMediaIds((prev) => [...prev, id]);
        }
    };

    const assignAudioToMedia = (mediaId: string, audioId: string) => {
        if (!audioId) {
            // remove assignment (sin efectos secundarios dentro del updater)
            const rest = { ...mediaAudioMap };
            delete rest[mediaId];
            setMediaAudioMap(rest);
            setAudioUsed(Object.keys(rest).length > 0);
        } else {
            setMediaAudioMap((prev) => ({ ...prev, [mediaId]: audioId }));
            setAudioUsed(true);
        }
    };

    const openAudioModalForMedia = (mediaId: string) => {
        setAudioModalMediaId(mediaId);
        setAudioModalSelectedId(mediaAudioMap[mediaId] || "");
        setShowAssignAudioModal(true);
    };

    const saveAudioModalSelection = () => {
        if (!audioModalMediaId) return;
        assignAudioToMedia(audioModalMediaId, audioModalSelectedId);
        setShowAssignAudioModal(false);
        setAudioModalMediaId(null);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setFileError("");

        try {
            const isEditing = !!slideMedia?.id;
            if (isEditing) {
                // For edit, use the first selected media (if any) and its audio mapping
                const mediaId = selectedMediaIds[0] || form.media_id;
                if (!mediaId) {
                    setError(t("errors.selectMediaRequired"));
                    setLoading(false);
                    return;
                }
                const payload: any = {
                    slide_id: form.slide_id,
                    media_id: mediaId,
                    duration: form.duration,
                    qr_id: form.qr_id || undefined,
                    description: form.description,
                    text_size: form.text_size,
                    description_position: form.description_position,
                };
                // only assign audio if the selected media is an image
                const editingMedia = allMedia.find((m) => m.id === parseInt(mediaId));
                const maybeAudio = mediaAudioMap[mediaId];
                if (editingMedia?.media_type === "image" && maybeAudio) {
                    payload.audio_media_id = maybeAudio;
                } else {
                    payload.audio_media_id = null;
                }
                // Clean undefined/empty optional fields
                // Object.keys(payload).forEach((k) => {
                //     if (payload[k] === undefined || payload[k] === null || payload[k] === "") delete payload[k];
                // });

                await updateSlideMedias(slideMedia.id, payload);
                setMessage(t("messages.updated"));
            } else {
                // Create multiple slide media, one per selected image
                if (selectedMediaIds.length === 0) {
                    setError(t("errors.selectAtLeastOne"));
                    setLoading(false);
                    return;
                }
                // Sequentially create to keep API simpler
                for (const mediaId of selectedMediaIds) {
                    const payload: any = {
                        slide_id: form.slide_id,
                        media_id: mediaId,
                        duration: form.duration,
                        qr_id: form.qr_id || undefined,
                        description: form.description,
                        text_size: form.text_size,
                        description_position: form.description_position,
                    };
                    const audioId = mediaAudioMap[mediaId];
                    const m = allMedia.find((mm) => mm.id === parseInt(mediaId));
                    if (m?.media_type === "image" && audioId) payload.audio_media_id = audioId;
                    // Clean undefined/empty optional fields
                    Object.keys(payload).forEach((k) => {
                        if (payload[k] === undefined || payload[k] === null || payload[k] === "") delete payload[k];
                    });
                    await createSlideMedias(payload);
                }
                setMessage(t("messages.created"));
            }

            // Redirect back to the slide media management page
            router.push(`/slides/media-management/${slideId}`);
        } catch (err: any) {
            if (err.response && err.response.data) {
                // setValidationErrors(err.response.data.errors || {});
                setError(t("errors.saveItem"));
            } else {
                setError(t("errors.saveItem"));
            }
        } finally {
            setLoading(false);
        }
    };

    // Filter media for selectors
    const filteredMedia = filterItems(
        allMedia.filter((m) => m.media_type === "image" || m.media_type === "video"),
        mediaSearchTerm
    );

    // Paginate media
    const totalMediaPages = Math.ceil(filteredMedia.length / itemsPerPage);
    const paginatedMedia = filteredMedia.slice(
        (currentMediaPage - 1) * itemsPerPage,
        currentMediaPage * itemsPerPage
    );

    // No audio pagination in the new modal-based assignment

    return (
        <Form onSubmit={handleSubmit} className="mx-auto p-10 bg-surface border border-line rounded-2xl shadow-theme-xs">
            <div className="mb-5">
                <Label>{t("labels.media")}</Label>
                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => setShowMediaSelector(true)}
                        className="group flex w-full items-center justify-between gap-4 rounded-xl border border-dashed border-line-strong bg-surface px-4 py-3.5 text-left transition-all hover:border-brand-500/60 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15"
                    >
                        <span className="flex min-w-0 items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                                <MdOutlinePermMedia size={22} />
                            </span>
                            <span className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-medium text-content-primary">
                                    {selectedMediaIds.length > 0
                                        ? (isEditing
                                            ? t("labels.changeSelection")
                                            : t("labels.changeSelectionWithCount", { n: selectedMediaIds.length }))
                                        : t("labels.selectMedia")}
                                </span>
                                <span className="truncate text-xs text-content-muted">
                                    {t("selector.typesHint")}
                                </span>
                            </span>
                        </span>
                        <span className="shrink-0 rounded-lg bg-surface-sunken px-3 py-1.5 text-xs font-semibold text-content-secondary transition-colors group-hover:text-content-primary">
                            {t("selector.browse")}
                        </span>
                    </button>

                    {selectedMediaIds.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {selectedMediaIds.map((id) => {
                                const media = allMedia.find((m) => m.id === parseInt(id));
                                if (!media) return null;
                                return (
                                    <div key={id} className="group relative rounded-xl border border-line bg-surface p-2 transition-colors hover:border-line-strong">
                                        {!isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => toggleSelectMedia(parseInt(id))}
                                                aria-label={t("selector.removeSelection")}
                                                className="absolute right-3 top-3 z-10 flex size-7 items-center justify-center rounded-full bg-surface-raised/90 text-content-muted shadow-theme-xs ring-1 ring-line transition-colors hover:bg-surface-sunken hover:text-error-600"
                                            >
                                                <MdClose size={16} />
                                            </button>
                                        )}
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-sunken">
                                            {media.media_type === "image" ? (
                                                <Image src={mediaUrl(media.file_path)} alt="preview" fill containerClassName="relative h-full w-full" className="object-contain" />
                                            ) : (
                                                <video src={mediaUrl(media.file_path)} className="h-full w-full object-contain" controls muted />
                                            )}
                                        </div>
                                        <p className="mt-2 truncate px-0.5 text-xs font-medium text-content-primary" title={getFileNameFromURL(media.file_path) || ""}>
                                            {getFileNameFromURL(media.file_path)}
                                        </p>
                                        {media.media_type === "image" && (
                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                <div className="truncate text-xs text-content-muted">
                                                    {mediaAudioMap[id]
                                                        ? t("labels.audioAssigned", { id: mediaAudioMap[id] })
                                                        : t("labels.noAudio")}
                                                </div>
                                                <Button type="button" variant="outline" size="sm" onClick={() => openAudioModalForMedia(id)}>
                                                    {t("labels.assignAudio")}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {showMediaSelector && (
                        <Modal
                            isOpen={showMediaSelector}
                            onClose={() => setShowMediaSelector(false)}
                            showCloseButton={false}
                            className="w-[95%] max-w-5xl overflow-hidden p-0"
                        >
                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-label={t("selector.title")}
                                className="flex max-h-[85vh] flex-col"
                                onKeyDown={(event) => {
                                    // Avoid submitting the slide form while typing in the selector search.
                                    if (event.key === "Enter" && (event.target as HTMLElement).tagName === "INPUT") {
                                        event.preventDefault();
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6 sm:py-5">
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-semibold text-content-primary sm:text-xl">
                                            {t("selector.title")}
                                        </h3>
                                        <p className="mt-1 text-xs text-content-muted sm:text-sm">
                                            {isEditing ? t("selector.subtitleSingle") : t("selector.subtitle")}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowMediaSelector(false)}
                                        aria-label={t("selector.close")}
                                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-hover text-content-muted transition-colors hover:bg-surface-sunken hover:text-content-primary"
                                    >
                                        <MdClose size={20} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                                    <div className="flex w-full flex-col gap-1.5 sm:w-80">
                                        <SearchInput
                                            value={mediaSearchTerm}
                                            onChange={(value) => {
                                                setMediaSearchTerm(value);
                                                setCurrentMediaPage(1);
                                            }}
                                            placeholder={t("selector.searchPlaceholder")}
                                            className="w-full"
                                        />
                                        <p className="text-[11px] leading-snug text-content-muted">
                                            {t("selector.availableHint")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-content-muted sm:text-sm">
                                            {t("selector.selectedCount", { n: selectedMediaIds.length })}
                                        </span>
                                        {selectedMediaIds.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedMediaIds([]);
                                                    setMediaAudioMap({});
                                                    setAudioUsed(false);
                                                }}
                                                className="text-xs font-medium text-brand-500 transition-colors hover:text-brand-600 sm:text-sm"
                                            >
                                                {t("selector.clearSelection")}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="min-h-[240px] flex-1 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">
                                    {paginatedMedia.length === 0 ? (
                                        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface text-center">
                                            <div className="flex size-12 items-center justify-center rounded-full bg-surface-sunken text-content-muted">
                                                <MdOutlinePermMedia size={24} />
                                            </div>
                                            <p className="text-sm font-medium text-content-secondary">
                                                {t("selector.empty")}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                                            {paginatedMedia.map((item: any) => {
                                                const isSelected = selectedMediaIds.includes(item.id.toString());
                                                const fileName = getFileNameFromURL(item.file_path) || String(item.id);
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => toggleSelectMedia(item.id)}
                                                        aria-pressed={isSelected}
                                                        className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 ${
                                                            isSelected
                                                                ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500"
                                                                : "border-line bg-surface hover:border-line-strong hover:bg-surface-hover"
                                                        }`}
                                                    >
                                                        <div className="relative aspect-video w-full overflow-hidden bg-surface-sunken">
                                                            {item.media_type === "image" ? (
                                                                <NextImage
                                                                    src={mediaUrl(item.file_path)}
                                                                    alt={fileName}
                                                                    fill
                                                                    unoptimized
                                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <>
                                                                    <video
                                                                        src={mediaUrl(item.file_path)}
                                                                        className="h-full w-full object-cover"
                                                                        muted
                                                                        preload="metadata"
                                                                    />
                                                                    <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                                        <span className="flex size-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                                                                            <MdPlayArrow size={24} />
                                                                        </span>
                                                                    </span>
                                                                </>
                                                            )}
                                                            <span className={`absolute left-2 top-2 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-theme-xs ${
                                                                item.media_type === "image" ? "bg-brand-500/90" : "bg-gray-900/80"
                                                            }`}>
                                                                {item.media_type}
                                                            </span>
                                                            <span className={`absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border-2 transition-all ${
                                                                isSelected
                                                                    ? "border-brand-500 bg-brand-500 text-white"
                                                                    : "border-white/70 bg-black/30 text-transparent group-hover:border-white"
                                                            }`}>
                                                                <MdCheck size={14} />
                                                            </span>
                                                        </div>
                                                        <div className="flex min-w-0 flex-col px-3 py-2.5">
                                                            <span className="truncate text-xs font-medium text-content-primary" title={fileName}>
                                                                {fileName}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col-reverse gap-3 border-t border-line bg-surface-raised px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    {totalMediaPages > 1 ? (
                                        <Pagination
                                            currentPage={currentMediaPage}
                                            totalPages={totalMediaPages}
                                            onPageChange={setCurrentMediaPage}
                                        />
                                    ) : (
                                        <span />
                                    )}
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowMediaSelector(false)}
                                        >
                                            {tCommon("cancel")}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            onClick={() => setShowMediaSelector(false)}
                                        >
                                            {t("selector.done")}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    )}
                </div>
            </div>

            {/* Removed global audio assignment section; now per-image from preview */}

            {selectedMediaIds.length > 0 && (!audioUsed) && (
                <div className="mb-5">
                    <Label>{t("labels.durationSeconds")}</Label>
                    <div className="text-xs text-content-muted mb-1">{t("hints.durationWithAudio")}</div>
                    <Input
                        name="duration"
                        type="number"
                        min="1"
                        value={form.duration}
                        onChange={handleChange}
                    />
                </div>
            )}


            <div className="mb-5">
                <Label>{t("labels.description")}</Label>
                <TextArea
                    value={form.description}
                    onChange={handleDescriptionChange}
                />
            </div>

            {form.description !== "" && (
                <div className="mb-5">
                    <ComponentCard title={t("sections.descriptionSettings")}>
                        <div className="flex flex-wrap items-center gap-8">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full">
                                <div className="flex-1 min-w-0">
                                    <Label>{t("labels.descriptionPosition")}</Label>
                                    <div className="relative mb-5">
                                        <Select
                                            defaultValue={form.description_position}
                                            onChange={handlePositionChange}
                                            options={descriptionPositions.map(u => ({
                                                value: u.value,
                                                label: u.label
                                            }))}
                                            className="w-full"
                                        />
                                        <span
                                            className="absolute text-content-muted -translate-y-1/2 pointer-events-none right-3 top-1/2">
                                            <ChevronDownIcon/>
                                        </span>
                                    </div>
                                    <Label>{t("labels.textSize")}</Label>
                                    <div className="relative">
                                        <Select
                                            defaultValue={form.text_size}
                                            onChange={handleTextSizeChange}
                                            options={textSizes.map(u => ({value: u.value, label: u.label}))}
                                            className="w-full"
                                        />
                                        <span
                                            className="absolute text-content-muted -translate-y-1/2 pointer-events-none right-3 top-1/2">
                                            <ChevronDownIcon/>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center flex-shrink-0 mt-4 sm:mt-0">
                                    <span className="font-medium mb-2">{t("labels.example")}</span>
                                    <PositionExample position={form.description_position}/>
                                </div>
                            </div>
                        </div>
                    </ComponentCard>
                </div>
            )}

            <div className="mb-8">
                <Label>{t("labels.selectQr")}</Label>
                <div className="flex flex-col gap-4">
                    {selectedQr ? (
                        <div className="p-3 border rounded-md mb-2">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 flex-shrink-0">
                                    <QRCodeCanvas
                                        value={selectedQr.info || ""}
                                        size={64}
                                        level="H"
                                        marginSize={1}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{t("labels.selectedQr")}</div>
                                    <div className="text-sm text-content-secondary">{selectedQr.name || t("labels.qrCode")}</div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowQrSelector(true)}
                                >
                                    {t("qrSelector.change")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => clearQr() }
                                >
                                    {t("qrSelector.remove")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowQrSelector(true)}
                            className="w-full"
                        >
                            {t("qrSelector.buttonSelect")}
                        </Button>
                    )}

                    {showQrSelector && (
                        <div className="mt-2 border rounded-md p-3">
                            <div className="mb-3 flex justify-between items-center">
                                <h3 className="font-medium">{t("qrSelector.title")}</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowQrSelector(false)}
                                >
                                    {t("qrSelector.close")}
                                </Button>
                            </div>
                            <SearchInput
                                value={qrSearchTerm}
                                onChange={setQrSearchTerm}
                                placeholder={t("qrSelector.searchPlaceholder")}
                                className="mb-3"
                            />

                            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                <Table className="min-w-full">
                                    <TableHeader>
                                        <TableRow>
                                            <TableCell
                                                className="">
                                                {t("qrSelector.headers.select")}
                                            </TableCell>
                                            <TableCell
                                                className="">{t("qrSelector.headers.name")}</TableCell>
                                            <TableCell
                                                className="">{t("qrSelector.headers.preview")}
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {qrCodes.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                       className="text-center">
                                                    {t("qrSelector.empty")}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            // Filter QR codes by search term
                                            qrCodes
                                                .filter(qr =>
                                                    qrSearchTerm === "" ||
                                                    (qr.name && qr.name.toLowerCase().includes(qrSearchTerm.toLowerCase())) ||
                                                    (qr.info && qr.info.toLowerCase().includes(qrSearchTerm.toLowerCase()))
                                                )
                                                .map((qr) => (
                                                    <TableRow key={qr.id}>
                                                        <TableCell
                                                            className="whitespace-nowrap">
                                                            <Checkbox
                                                                checked={selectedQrId === qr.id.toString()}
                                                                onChange={() => handleSelectQr(qr.id)}
                                                            />
                                                        </TableCell>
                                                        <TableCell
                                                            className="whitespace-nowrap">
                                                            {qr.name || t("labels.qrCode")}
                                                        </TableCell>
                                                        <TableCell
                                                            className="whitespace-nowrap">
                                                            <QRCodeCanvas
                                                                value={qr.info || ""}
                                                                size={48}
                                                                level="H"
                                                                marginSize={1}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {selectedQr && (
                        <div className="flex flex-col items-center gap-2 mt-4">
                            <QRCodeCanvas
                                id="qrcode-canvas"
                                value={selectedQr.info || ""}
                                size={120}
                                level="H"
                                marginSize={1}
                            />
                            <Button type="button" variant="outline" onClick={handleDownloadQr}
                                    className="mt-2 w-full">
                                {tQrButtons("downloadQr")}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline"
                        onClick={() => router.push(`/slides/media-management/${slideId}`)}>
                    {tCommon("cancel")}
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                    { slideMedia ? tCommon("saveChanges") : tCommon("add")}
                </Button>
            </div>
            {/* Modal para asignar audio a una imagen (tabla con preview) */}
            <Modal isOpen={showAssignAudioModal} onClose={() => setShowAssignAudioModal(false)} className="max-w-4xl w-[95%] p-6">
                <h3 className="text-lg font-semibold mb-4">{t("labels.assignAudio")}</h3>
                <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableCell className="">{t("selector.headers.select")}</TableCell>
                                <TableCell className="">{tTableHeaders("audio")}</TableCell>
                                <TableCell className="">{tTableHeaders("preview")}</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="px-3 py-2 text-sm text-content-primary">
                                    <input
                                        type="radio"
                                        name="audio-select"
                                        checked={audioModalSelectedId === ""}
                                        onChange={() => setAudioModalSelectedId("")}
                                    />
                                </TableCell>
                                <TableCell className="px-3 py-2 text-sm text-content-primary">{t("labels.noAudio")}</TableCell>
                                <TableCell className="px-3 py-2 text-sm text-content-secondary">—</TableCell>
                            </TableRow>
                            {allAudios.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-3 py-4 text-center text-sm text-content-secondary" colSpan={3}>
                                        {tTableStates("empty")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                allAudios.map((a) => (
                                    <TableRow key={a.id}>
                                        <TableCell className="px-3 py-2">
                                            <input
                                                type="radio"
                                                name="audio-select"
                                                checked={audioModalSelectedId === a.id.toString()}
                                                onChange={() => setAudioModalSelectedId(a.id.toString())}
                                            />
                                        </TableCell>
                                        <TableCell className="px-3 py-2 text-sm text-content-primary">{tTableHeaders("audio")} #{a.id}</TableCell>
                                        <TableCell className="px-3 py-2">
                                            <audio controls src={mediaUrl(a.file_path)} className="w-56" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowAssignAudioModal(false)}>{tCommon("cancel")}</Button>
                    <Button type="button" variant="primary" onClick={saveAudioModalSelection}>{tCommon("saveChanges")}</Button>
                </div>
            </Modal>
        </Form>
    )
};

export default SlideMediaForm;
