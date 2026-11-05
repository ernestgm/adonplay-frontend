"use client";

import React, {useState, useEffect, ReactNode} from "react";
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
import {useMessage} from "@/context/MessageContext";
import {useRouter} from "next/navigation";
import Pagination from "../../../tables/Pagination";
import Select from "../../../form/Select";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import Image from "@/components/ui/images/ExpandableImage";
import {
    MdDelete,
    MdEdit,
    MdInfo,
    MdAudioFile,
    MdVideoFile,
    MdArrowUpward,
    MdArrowDownward
} from "react-icons/md";
import {ChevronDownIcon} from "@/icons";
import config from "@/config/globalConfig";
import ActionModal from "@/components/ui/modal/ActionModal";
import filterItems from "@/utils/filterItems";
import SearchInput from "@/components/tables/SearchInput";
import TableSkeleton from "@/components/tables/TableSkeleton";
import EmptyState from "@/components/tables/EmptyState";
import useDebounce from "@/hooks/useDebounce";
import mediaUrl from "@/utils/files";
import {deleteSlideMedias, fetchSlideMedias, reorderSlideMedias} from "@/server/api/slidesMedia";
import {QRCodeCanvas} from "qrcode.react";
import { useT } from "@/i18n/I18nProvider";
import {getFileNameFromURL} from "@/utils/firebaseStorage";
import ExpandableImage from "@/components/ui/images/ExpandableImage";

interface SlideMediaTableProps {
    slide?: any; // Optional className for styling
}
const SlideMediaTable: React.FC<SlideMediaTableProps> = ({slide}) => {
    const router = useRouter();
    const tCommon = useT("common.buttons");
    const tTable = useT("common.table");
    const tHeaders = useT("common.table.headers");
    const tActions = useT("common.table.actions");
    const tFilters = useT("common.table.filters");
    const [media, setMedia] = useState<any[]>([]); // This will now store the array of slide_media objects
    const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
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
                const data = await fetchSlideMedias(slide);
                // The data is already the array of slide_media objects
                // Sort the media by order
                const sortedData = [...data].sort((a, b) => parseInt(a.order) - parseInt(b.order));
                setMedia(sortedData);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slide, setError]); // Added slide and setError to dependency array

    // Reordena de forma atómica usando el endpoint /slides/:id/media/reorder.
    // Antes se hacían dos PUT separados: si el segundo fallaba, el orden quedaba
    // inconsistente.
    const moveItem = async (item: any, offset: number) => {
        const ordered = [...media].sort((a, b) => parseInt(a.order) - parseInt(b.order));
        const index = ordered.findIndex((m) => m.id === item.id);
        const targetIndex = index + offset;

        if (index === -1 || targetIndex < 0 || targetIndex >= ordered.length) return;

        const mediaIds = ordered.map((m) => m.media_id);
        [mediaIds[index], mediaIds[targetIndex]] = [mediaIds[targetIndex], mediaIds[index]];

        try {
            await reorderSlideMedias(slide, mediaIds);
            setMedia(mediaIds.map((mediaId, i) => {
                const record = ordered.find((m) => m.media_id === mediaId);
                return {...record, order: i};
            }));
            setMessage("OK");
        } catch (err: any) {
            setError(err.data?.message || err.message || "Error");
        }
    };

    const handleMoveUp = async (item: any) => {
        await moveItem(item, -1);
    };

    const handleMoveDown = async (item: any) => {
        await moveItem(item, 1);
    };

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
                // When deleting, we need to pass the IDs of the slide_media entries
                const response = await deleteSlideMedias(selectedMedia);
                setMedia((prev) => prev.filter((item) => !selectedMedia.includes(item.id)));
                setSelectedMedia([]);
                setMessage(response.message);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error");
            } finally {
                setIsWarningModalOpen(false);
            }
        }
    };

    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const filteredMedia = filterItems(media, debouncedSearchTerm);
    const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
    const paginatedMedia = filteredMedia.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleEdit = (slideMediaId: any) => {
        router.push(`/slides/media-management/${slide}/edit/${slideMediaId}`);
    };

    // This handleViewDetails now redirects to the slide media details page
    const handleViewDetails = (slideMediaId: any) => {
        router.push(`/slides/media-management/${slide}/details/${slideMediaId}`);
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
                    {label: tCommon("delete"), onClick: confirmDeleteMedia, variant: "primary"},
                ]}
            />
            <div>
                <div className="flex items-center justify-between mb-4">
                    {selectedMedia.length > 0 ? (
                        <div className={selectedMedia.length === 0 ? "hidden" : "flex"}>
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
                        </div>
                    ) : (
                        <Button
                            onClick={() => router.push(`/slides/media-management/${slide}/create`)}
                            variant="primary"
                            size="sm"
                            className="mb-2 sm:mb-0 sm:w-auto"
                        >
                            <span className="hidden sm:block">{tCommon("create")}</span>
                            <span className="block sm:hidden">+</span>
                        </Button>
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
                    <TableSkeleton columns={10} />
                ) : paginatedMedia.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>
                                        <Checkbox
                                            // Now check against item.id (slide_media id)
                                            checked={selectedMedia.length === media.length}
                                            onChange={(checked) =>
                                                setSelectedMedia(checked ? media.map((item) => item.id) : [])
                                            }
                                        />
                                    </TableCell>
                                    <TableCell isHeader>{tHeaders("order")}</TableCell>
                                    <TableCell isHeader>{tHeaders("audio")}</TableCell>
                                    <TableCell isHeader>{tHeaders("file")}</TableCell>
                                    <TableCell isHeader>{tHeaders("name")}</TableCell>
                                    <TableCell isHeader>{tHeaders("qr")}</TableCell>
                                    <TableCell isHeader>{tHeaders("description")}</TableCell>
                                    <TableCell isHeader>{tHeaders("duration")}</TableCell>
                                    <TableCell isHeader>{tHeaders("user")}</TableCell>
                                    <TableCell isHeader className="text-right sticky right-0 bg-surface-sunken z-10">{tHeaders("actions")}</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedMedia.map((item: any, index: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="whitespace-nowrap">
                                            <Checkbox
                                                // Check against item.id (slide_media id)
                                                checked={selectedMedia.includes(item.id)}
                                                onChange={() => toggleSelectMedia(item.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span>{item.order}</span>
                                                <div className="flex flex-col">
                                                    <Tooltip content={tActions("moveUp")}>
                                                        <Button
                                                            onClick={() => handleMoveUp(item)}
                                                            variant="outline"
                                                            size="normal"
                                                            disabled={currentPage === 1 && index === 0}
                                                            className="p-0 h-6"
                                                        >
                                                            <MdArrowUpward size={16}/>
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip content={tActions("moveDown")}>
                                                        <Button
                                                            onClick={() => handleMoveDown(item)}
                                                            variant="outline"
                                                            size="normal"
                                                            disabled={currentPage === totalPages && index === paginatedMedia.length - 1}
                                                            className="p-0 h-6 mt-1"
                                                        >
                                                            <MdArrowDownward size={16}/>
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </TableCell>
                                        {/* Access owner name from nested media object */}
                                        <TableCell className="whitespace-nowrap">
                                            {item.audio_media_id ? (
                                                <div className="flex items-center">
                                                    <MdAudioFile size={24} className="text-blue-light-500 dark:text-blue-light-400 mr-2"/>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {/* Access media_type and file_path from nested media object */}
                                            {item.media.media_type === "image" ? (
                                                <div className="border rounded overflow-hidden">
                                                    <Image
                                                        src={mediaUrl(item.media.file_path)}
                                                        alt="Picture of the author"
                                                        className="w-full h-full object-cover"
                                                        width={config.thumbnailSizes.width}
                                                        height={config.thumbnailSizes.height}
                                                    />
                                                </div>
                                            ) : item.media.media_type === "video" ? (
                                                <div className="flex items-center">
                                                    <MdVideoFile size={24} className="text-blue-light-500 dark:text-blue-light-400 mr-2"/>
                                                    <span>{tHeaders("video")}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <MdAudioFile size={24} className="text-blue-light-500 dark:text-blue-light-400 mr-2"/>
                                                    <span>{tHeaders("audio")}</span>
                                                </div>
                                            )
                                            }
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            { getFileNameFromURL(item.media.file_path) }
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            { item.qr ? (
                                                <QRCodeCanvas
                                                    id="qrcode-canvas"
                                                    value={item.qr.info || []}
                                                    size={30}
                                                    level="H"
                                                    marginSize={1}
                                                />
                                                ) : ("-")
                                            }
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {item.description ? (
                                                <div className="max-w-xs truncate">{item.description}</div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {/* Hide duration if image has audio */}
                                            {item.media.media_type === "image" && item.audio_media_id ? (
                                                <span className="text-gray-400">-</span>
                                            ) : item.media.media_type === "video" ? (
                                                <span className="text-gray-400">-</span>
                                            ) : (
                                                <span>{item.duration}s</span>
                                            )}
                                        </TableCell>
                                        <TableCell
                                            className="whitespace-nowrap">{item.media.owner.name}</TableCell>
                                        <TableCell
                                            className="whitespace-nowrap relative sticky right-0 bg-surface z-10 group-hover:bg-surface-hover">
                                            <div className="flex gap-2 justify-end">
                                                <Tooltip content={tActions("view")}>
                                                    <Button
                                                        // Pass the slide media ID to handleViewDetails
                                                        onClick={() => handleViewDetails(item.id)}
                                                        variant="primary"
                                                        size="sm"
                                                    >
                                                        <MdInfo size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content={tActions("edit")}>
                                                    <Button
                                                        // Pass the slide_media ID to handleEdit
                                                        onClick={() => handleEdit(item.id)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <MdEdit size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content={tActions("delete")}>
                                                    <Button
                                                        // Pass the slide_media ID to openWarningModal
                                                        onClick={() => openWarningModal(item.id)}
                                                        variant="danger"
                                                        size="sm"
                                                    >
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

export default SlideMediaTable;