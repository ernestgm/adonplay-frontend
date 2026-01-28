"use client";

import React, {useState, useEffect} from "react";
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
import Input from "@/components/form/input/InputField";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import {MdSearch, MdDelete, MdEdit, MdInfo, MdAudioFile, MdVideoFile, MdAttachMoney} from "react-icons/md";
import {ChevronDownIcon} from "@/icons";
import config from "@/config/globalConfig";
import ActionModal from "@/components/ui/modal/ActionModal";
import filterItems from "@/utils/filterItems";
import { fetchMedia, deleteMedia } from "@/server/api/media";
import mediaUrl from "@/utils/files";
import Image from "next/image";
import { deleteFileByDownloadURL } from "@/utils/firebaseStorage";
import { useT } from "@/i18n/I18nProvider";

const MediaTable = () => {
    const tMediaForm = useT("forms.mediaForm");
    const tCommon = useT("common.buttons");
    const tTable = useT("common.table");
    const tHeaders = useT("common.table.headers");
    const tActions = useT("common.table.actions");
    const tStates = useT("common.table.states");
    const tFilters = useT("common.table.filters");
    const router = useRouter();
    const [media, setMedia] = useState<any[]>([]);
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
                const data = await fetchMedia();
                setMedia(data);
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

                const jsonToDelete = media
                    .filter((item) => selectedMedia.includes(item.id))
                    .map((item) => item.json_path)
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

                Promise.allSettled(
                    jsonToDelete.map((url: string) => deleteFileByDownloadURL(url))
                ).then(() => {/* noop */});

            } catch (err: any) {
                setError(err.data?.message || err.message || "Error");
            } finally {
                setIsWarningModalOpen(false);
            }
        }
    };

    const filteredMedia = filterItems(media, searchTerm);
    const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
    const paginatedMedia = filteredMedia.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleEditPrices = (mediaId: any) => {
        router.push(`/media-library/edit-prices/${mediaId}`);
    };

    const handleEdit = (mediaId: any) => {
        router.push(`/media-library/edit/${mediaId}`);
    };
    
    const handleViewDetails = (mediaId: any) => {
        router.push(`/media-library/details/${mediaId}`);
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
            <div>
                <div className="flex items-center justify-between mb-4">
                    { selectedMedia.length > 0 ? (
                        <div className={ selectedMedia.length === 0 ? "hidden" : "flex"}>
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
                            onClick={() => router.push(`/media-library/create`)}
                            variant="primary"
                            size="sm"
                            className="mb-2 sm:mb-0 sm:w-auto"
                        >
                            <span className="hidden sm:block">{tCommon("create")}</span>
                            <span className="block sm:hidden">+</span>
                        </Button>
                    )}
                    <div className="relative">
                        <Input
                            placeholder={tFilters("searchPlaceholder")}
                            defaultValue={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            type="text"
                            className="pl-[62px]"
                        />
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 p-2 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                            <MdSearch size={20}/>
                        </span>
                    </div>
                </div>
                {loading ? (
                    <div>{tStates("loading")}</div>
                ) : paginatedMedia.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">{tStates("empty")}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full divide-y divide-gray-200">
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        <Checkbox
                                            checked={selectedMedia.length === media.length}
                                            onChange={(checked) =>
                                                setSelectedMedia(checked ? media.map((item) => item.id) : [])
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tHeaders("user")}</TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tHeaders("file")}</TableCell>
                                    <TableCell className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 z-10">{tHeaders("actions")}</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white divide-y divide-gray-200">
                                {paginatedMedia.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Checkbox
                                                checked={selectedMedia.includes(item.id)}
                                                onChange={() => toggleSelectMedia(item.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.owner.name}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.media_type === "image" ? (
                                                <div className="w-16 h-16 border rounded overflow-hidden">
                                                    <Image
                                                        src={mediaUrl(item.file_path)}
                                                        alt="Image preview"
                                                        className="w-full h-full object-cover"
                                                        width={160}
                                                        height={160}
                                                    />
                                                </div>
                                            ) : item.media_type === "video" ? (
                                                <div className="flex items-center">
                                                    <MdVideoFile size={24} className="text-blue-500 mr-2" />
                                                    <span>{tHeaders("video")}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <MdAudioFile size={24} className="text-blue-500 mr-2" />
                                                    <span>{tHeaders("audio")}</span>
                                                </div>
                                            )
                                            }
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap relative sticky right-0 bg-white z-10">
                                            <div className="flex gap-2 justify-end">
                                                {item.is_editable && (
                                                    <Tooltip content={tMediaForm("labels.editPrices")}>
                                                        <Button
                                                            onClick={() => handleEditPrices(item.id)}
                                                            variant="primary"
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 border-green-600"
                                                        >
                                                            <MdAttachMoney size={18}/>
                                                        </Button>
                                                    </Tooltip>
                                                )}
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
                                    onChange={(value) => setItemsPerPage(Number(value))}
                                    className="border border-gray-300 rounded px-2 py-1 w-full sm:w-auto"
                                />
                                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
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
