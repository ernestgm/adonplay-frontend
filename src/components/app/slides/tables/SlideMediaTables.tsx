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
import Input from "@/components/form/input/InputField";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import Image from 'next/image'
import {
    MdSearch,
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
import mediaUrl from "@/utils/files";
import {deleteSlideMedias, fetchSlideMedias, updateSlideMedias} from "@/server/api/slidesMedia";
import {QRCodeCanvas} from "qrcode.react";

interface SlideMediaTableProps {
    slide?: any; // Optional className for styling
}
const SlideMediaTable: React.FC<SlideMediaTableProps> = ({slide}) => {
    const router = useRouter();
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
                setError(err.data?.message || err.message || "Error al cargar media");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slide, setError]); // Added slide and setError to dependency array

    // Function to handle moving an item up in order
    const handleMoveUp = async (item: any, index: number) => {
        if (index === 0) return; // Already at the top

        try {
            // Get the item above
            const prevItem = paginatedMedia[index - 1];

            // Swap orders
            const newOrder = parseInt(prevItem.order);
            const prevOrder = parseInt(item.order);

            // Update current item with new order
            await updateSlideMedias(item.id, {order: newOrder});

            // Update previous item with current item's order
            await updateSlideMedias(prevItem.id, {order: prevOrder});

            // Update local state
            const updatedMedia = [...media];
            const itemIndex = updatedMedia.findIndex(m => m.id === item.id);
            const prevItemIndex = updatedMedia.findIndex(m => m.id === prevItem.id);

            if (itemIndex !== -1 && prevItemIndex !== -1) {
                updatedMedia[itemIndex] = {...updatedMedia[itemIndex], order: newOrder};
                updatedMedia[prevItemIndex] = {...updatedMedia[prevItemIndex], order: prevOrder};

                // Sort the updated media by order
                const sortedMedia = [...updatedMedia].sort((a, b) => parseInt(a.order) - parseInt(b.order));
                setMedia(sortedMedia);
            }

            setMessage("Orden actualizado correctamente");
        } catch (err: any) {
            setError(err.data?.message || err.message || "Error al actualizar el orden");
        }
    };

    // Function to handle moving an item down in order
    const handleMoveDown = async (item: any, index: number) => {
        if (index === paginatedMedia.length - 1) return; // Already at the bottom

        try {
            // Get the item below
            const nextItem = paginatedMedia[index + 1];

            // Swap orders
            const newOrder = parseInt(nextItem.order);
            const nextOrder = parseInt(item.order);

            // Update current item with new order
            await updateSlideMedias(item.id, {order: newOrder});

            // Update next item with current item's order
            await updateSlideMedias(nextItem.id, {order: nextOrder});

            // Update local state
            const updatedMedia = [...media];
            const itemIndex = updatedMedia.findIndex(m => m.id === item.id);
            const nextItemIndex = updatedMedia.findIndex(m => m.id === nextItem.id);

            if (itemIndex !== -1 && nextItemIndex !== -1) {
                updatedMedia[itemIndex] = {...updatedMedia[itemIndex], order: newOrder};
                updatedMedia[nextItemIndex] = {...updatedMedia[nextItemIndex], order: nextOrder};

                // Sort the updated media by order
                const sortedMedia = [...updatedMedia].sort((a, b) => parseInt(a.order) - parseInt(b.order));
                setMedia(sortedMedia);
            }

            setMessage("Orden actualizado correctamente");
        } catch (err: any) {
            setError(err.data?.message || err.message || "Error al actualizar el orden");
        }
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
                setError(err.data?.message || err.message || "Error al eliminar media");
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
                title="Warning"
                message="¿Estás seguro de que deseas eliminar este elemento?"
                actions={[
                    {label: "Cancelar", onClick: () => setIsWarningModalOpen(false)},
                    {label: "Eliminar", onClick: confirmDeleteMedia, variant: "primary"},
                ]}
            />
            <div>
                <div className="flex items-center justify-between mb-4">
                    {selectedMedia.length > 0 ? (
                        <div className={selectedMedia.length === 0 ? "hidden" : "flex"}>
                            <Tooltip content="Eliminar seleccionados">
                                <Button
                                    size="sm"
                                    onClick={deleteSelectedMedia}
                                    disabled={selectedMedia.length === 0}
                                    variant="primary"
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
                            <span className="hidden sm:block">+ Adicionar media</span>
                            <span className="block sm:hidden">+</span>
                        </Button>
                    )}
                    <div className="relative">
                        <Input
                            placeholder="Buscar..."
                            defaultValue={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            type="text"
                            className="pl-[62px]"
                        />
                        <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 p-2 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                            <MdSearch size={20}/>
                        </span>
                    </div>
                </div>
                {loading ? (
                    <div>Loading...</div>
                ) : paginatedMedia.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No hay media para mostrar.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full divide-y divide-gray-200">
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        <Checkbox
                                            // Now check against item.id (slide_media id)
                                            checked={selectedMedia.length === media.length}
                                            onChange={(checked) =>
                                                setSelectedMedia(checked ? media.map((item) => item.id) : [])
                                            }
                                        />
                                    </TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audio</TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qr</TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 z-10">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white divide-y divide-gray-200">
                                {paginatedMedia.map((item: any, index: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Checkbox
                                                // Check against item.id (slide_media id)
                                                checked={selectedMedia.includes(item.id)}
                                                onChange={() => toggleSelectMedia(item.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <span>{item.order}</span>
                                                <div className="flex flex-col">
                                                    <Tooltip content="Mover arriba">
                                                        <Button
                                                            onClick={() => handleMoveUp(item, index)}
                                                            variant="primary"
                                                            size="sm"
                                                            disabled={index === 0}
                                                            className="p-1 h-6"
                                                        >
                                                            <MdArrowUpward size={16}/>
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip content="Mover abajo">
                                                        <Button
                                                            onClick={() => handleMoveDown(item, index)}
                                                            variant="primary"
                                                            size="sm"
                                                            disabled={index === paginatedMedia.length - 1}
                                                            className="p-1 h-6"
                                                        >
                                                            <MdArrowDownward size={16}/>
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </TableCell>
                                        {/* Access owner name from nested media object */}
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.audio_media_id ? (
                                                <div className="flex items-center">
                                                    <MdAudioFile size={24} className="text-blue-500 mr-2"/>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {/* Access media_type and file_path from nested media object */}
                                            {item.media.media_type === "image" ? (
                                                <div className="w-16 h-16 border rounded overflow-hidden">
                                                    <Image
                                                        src={mediaUrl(item.media.file_path)}
                                                        alt="Picture of the author"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : item.media.media_type === "video" ? (
                                                <div className="flex items-center">
                                                    <MdVideoFile size={24} className="text-blue-500 mr-2"/>
                                                    <span>Video</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <MdAudioFile size={24} className="text-blue-500 mr-2"/>
                                                    <span>Audio</span>
                                                </div>
                                            )
                                            }
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.description ? (
                                                <div className="max-w-xs truncate">{item.description}</div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.media.owner.name}</TableCell>
                                        <TableCell
                                            className="px-6 py-4 whitespace-nowrap relative sticky right-0 bg-white z-10">
                                            <div className="flex gap-2 justify-end">
                                                <Tooltip content="Ver Detalles">
                                                    <Button
                                                        // Pass the slide media ID to handleViewDetails
                                                        onClick={() => handleViewDetails(item.id)}
                                                        variant="primary"
                                                        size="sm"
                                                    >
                                                        <MdInfo size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Editar">
                                                    <Button
                                                        // Pass the slide_media ID to handleEdit
                                                        onClick={() => handleEdit(item.id)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <MdEdit size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Eliminar">
                                                    <Button
                                                        // Pass the slide_media ID to openWarningModal
                                                        onClick={() => openWarningModal(item.id)}
                                                        variant="primary"
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
                                        label: `${value} items per page`
                                    }))}
                                    placeholder="Select items per page"
                                    defaultValue={config.defaultItemsPerPage.toString()}
                                    onChange={(value) => setItemsPerPage(Number(value))}
                                    className="border border-gray-300 rounded px-2 py-1 w-full sm:w-auto"
                                />
                                <span
                                    className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
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