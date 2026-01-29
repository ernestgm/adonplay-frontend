"use client";

import React, {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
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
import {MdSearch} from "react-icons/md";
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
    const [itemsPerPage] = useState(5);
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
            setAudioUsed((prev) => !!(mediaAudioMap[id]));
            return;
        }
        setSelectedMediaIds((prev) => {
            if (prev.includes(id)) {
                const next = prev.filter((m) => m !== id);
                // Also remove any audio assignment for this media
                setMediaAudioMap((map) => {
                    const { [id]: _, ...rest } = map;
                    setAudioUsed(Object.keys(rest).length > 0);
                    return rest;
                });
                return next;
            } else {
                return [...prev, id];
            }
        });
    };

    const assignAudioToMedia = (mediaId: string, audioId: string) => {
        if (!audioId) {
            // remove assignment
            setMediaAudioMap((prev) => {
                const { [mediaId]: _, ...rest } = prev;
                setAudioUsed(Object.keys(rest).length > 0);
                return rest;
            });
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
        <Form onSubmit={handleSubmit} className="mx-auto p-10 bg-white rounded shadow">
            <div className="mb-5">
                <Label>{t("labels.selectMedia")}</Label>
                <div className="flex flex-col gap-2">
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowMediaSelector(true)}
                            className="w-full"
                        >
                            {selectedMediaIds.length > 0
                                ? (isEditing
                                    ? t("labels.changeSelection")
                                    : t("labels.changeSelectionWithCount", { n: selectedMediaIds.length }))
                                : t("labels.selectMedia")}
                        </Button>
                    </div>

                    {selectedMediaIds.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                            {selectedMediaIds.map((id) => {
                                const media = allMedia.find((m) => m.id === parseInt(id));
                                if (!media) return null;
                                return (
                                    <div key={id} className="border rounded p-2">
                                        <div className="w-full aspect-video relative overflow-hidden rounded">
                                            {media.media_type === "image" ? (
                                                <Image src={mediaUrl(media.file_path)} alt="preview" fill className="object-cover" />
                                            ) : (
                                                <video src={mediaUrl(media.file_path)} className="w-full h-full object-cover" controls muted />
                                            )}
                                        </div>
                                        {media.media_type === "image" && (
                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                <div className="text-xs text-gray-600">
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
                        <div className="mt-2 border rounded-md p-3">
                            <div className="mb-3 flex justify-between items-center">
                                <h3 className="font-medium">{t("selector.title")}</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMediaSelector(false)}
                                >
                                    {t("selector.close")}
                                </Button>
                            </div>
                            <div className="relative mb-3">
                                <Input
                                    placeholder={t("selector.searchPlaceholder")}
                                    value={mediaSearchTerm}
                                    onChange={(e) => setMediaSearchTerm(e.target.value)}
                                    type="text"
                                    className="pl-[62px]"
                                />
                                <span
                                    className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 p-2 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                    <MdSearch size={20}/>
                                </span>
                            </div>

                            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                <Table className="min-w-full divide-y divide-gray-200">
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t("selector.headers.select")}</TableCell>
                                            <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t("selector.headers.name")}</TableCell>
                                            <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t("selector.headers.preview")}</TableCell>
                                            <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t("selector.headers.type")}</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="bg-white divide-y divide-gray-200">
                                        {paginatedMedia.length === 0 ? (
                                            <TableRow>
                                                <TableCell className="px-3 py-2 text-center text-sm text-gray-500" colSpan={3}>
                                                    {t("selector.empty")}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedMedia.map((item: any) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                        {isEditing ? (
                                                            <input
                                                                type="radio"
                                                                name="media-select"
                                                                checked={selectedMediaIds.includes(item.id.toString())}
                                                                onChange={() => toggleSelectMedia(item.id)}
                                                            />
                                                        ) : (
                                                            <Checkbox
                                                                checked={selectedMediaIds.includes(item.id.toString())}
                                                                onChange={() => toggleSelectMedia(item.id)}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                                        { getFileNameFromURL(item.file_path) }
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="border rounded overflow-hidden">
                                                            {item.media_type === "image" ? (
                                                                <Image
                                                                    src={mediaUrl(item.file_path)}
                                                                    alt="Image preview"
                                                                    className="w-full h-full object-cover"
                                                                    width={config.thumbnailSizes.width}
                                                                    height={config.thumbnailSizes.height}
                                                                />
                                                            ) : (
                                                                <video src={mediaUrl(item.file_path)} className="w-full h-full object-cover" muted />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                                        {item.media_type}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-3 flex justify-center">
                                <Pagination
                                    currentPage={currentMediaPage}
                                    totalPages={totalMediaPages}
                                    onPageChange={setCurrentMediaPage}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Removed global audio assignment section; now per-image from preview */}

            {selectedMediaIds.length > 0 && (!audioUsed) && (
                <div className="mb-5">
                    <Label>{t("labels.durationSeconds")}</Label>
                    <div className="text-xs text-gray-500 mb-1">{t("hints.durationWithAudio")}</div>
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
                                            className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
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
                                            className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
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
                                    <div className="text-sm text-gray-500">{selectedQr.name || t("labels.qrCode")}</div>
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
                            <div className="relative mb-3">
                                <Input
                                    placeholder={t("qrSelector.searchPlaceholder")}
                                    value={qrSearchTerm}
                                    onChange={(e) => setQrSearchTerm(e.target.value)}
                                    type="text"
                                    className="pl-[62px]"
                                />
                                <span
                                    className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 p-2 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                    <MdSearch size={20}/>
                                </span>
                            </div>

                            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                <Table className="min-w-full divide-y divide-gray-200">
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableCell
                                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                {t("qrSelector.headers.select")}
                                            </TableCell>
                                            <TableCell
                                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t("qrSelector.headers.name")}</TableCell>
                                            <TableCell
                                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t("qrSelector.headers.preview")}
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="bg-white divide-y divide-gray-200">
                                        {qrCodes.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                       className="px-3 py-2 text-center text-sm text-gray-500">
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
                                                            className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            <Checkbox
                                                                checked={selectedQrId === qr.id.toString()}
                                                                onChange={() => handleSelectQr(qr.id)}
                                                            />
                                                        </TableCell>
                                                        <TableCell
                                                            className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            {qr.name || t("labels.qrCode")}
                                                        </TableCell>
                                                        <TableCell
                                                            className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
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
                    { slideMedia ? tCommon("saveChanges") : tCommon("create")}
                </Button>
            </div>
            {/* Modal para asignar audio a una imagen (tabla con preview) */}
            <Modal isOpen={showAssignAudioModal} onClose={() => setShowAssignAudioModal(false)} className="max-w-4xl w-[95%] p-6">
                <h3 className="text-lg font-semibold mb-4">{t("labels.assignAudio")}</h3>
                <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                    <Table className="min-w-full divide-y divide-gray-200">
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t("selector.headers.select")}</TableCell>
                                <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{tTableHeaders("audio")}</TableCell>
                                <TableCell className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{tTableHeaders("preview")}</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-white divide-y divide-gray-200">
                            <TableRow>
                                <TableCell className="px-3 py-2 text-sm text-gray-700">
                                    <input
                                        type="radio"
                                        name="audio-select"
                                        checked={audioModalSelectedId === ""}
                                        onChange={() => setAudioModalSelectedId("")}
                                    />
                                </TableCell>
                                <TableCell className="px-3 py-2 text-sm text-gray-700">{t("labels.noAudio")}</TableCell>
                                <TableCell className="px-3 py-2 text-sm text-gray-500">—</TableCell>
                            </TableRow>
                            {allAudios.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-3 py-4 text-center text-sm text-gray-500" colSpan={3}>
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
                                        <TableCell className="px-3 py-2 text-sm text-gray-700">{tTableHeaders("audio")} #{a.id}</TableCell>
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