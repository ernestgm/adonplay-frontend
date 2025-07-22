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
import {MdSearch, MdDelete, MdEdit, MdInfo, MdAudioFile, MdVideoFile} from "react-icons/md";
import {ChevronDownIcon} from "@/icons";
import config from "@/config/globalConfig";
import ActionModal from "@/components/ui/modal/ActionModal";
import filterItems from "@/utils/filterItems";
import { fetchMedia, deleteMedia } from "@/server/api/media";

// Base URL for media files
const FTP_BASE_URL = process.env.FTP_BASE_URL || "http://adonplayftp.geniusdevelops.com/";

const MediaTable = ({slide}) => {
    const router = useRouter();
    const [media, setMedia] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState([]);
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
                const data = await fetchMedia(slide);
                setMedia(data);
            } catch (err) {
                setError(err.data?.message || err.message || "Error al cargar media");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleSelectMedia = (id) => {
        setSelectedMedia((prev) =>
            prev.includes(id) ? prev.filter((mediaId) => mediaId !== id) : [...prev, id]
        );
    };

    const deleteSelectedMedia = async () => {
        setIsWarningModalOpen(true);
    };

    const openWarningModal = (mediaId) => {
        setSelectedMedia([mediaId]);
        setIsWarningModalOpen(true);
    };

    const confirmDeleteMedia = async () => {
        if (selectedMedia.length > 0) {
            try {
                await deleteMedia(slide, selectedMedia);
                setMedia((prev) => prev.filter((item) => !selectedMedia.includes(item.id)));
                setSelectedMedia([]);
                setMessage("Media eliminada correctamente");
            } catch (err) {
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

    const handleEdit = (mediaId) => {
        router.push(`/slides/edit/${slide}/media/edit/${mediaId}`);
    };
    
    const handleViewDetails = (mediaId) => {
        router.push(`/slides/edit/${slide}/media/details/${mediaId}`);
    };

    return (
        <>
            <ActionModal
                isOpen={isWarningModalOpen}
                onClose={() => setIsWarningModalOpen(false)}
                title="Warning"
                message="¿Estás seguro de que deseas eliminar este elemento?"
                actions={[
                    { label: "Cancelar", onClick: () => setIsWarningModalOpen(false) },
                    { label: "Eliminar", onClick: confirmDeleteMedia, variant: "danger" },
                ]}
            />
            <div>
                <div className="flex items-center justify-between mb-4">
                    { selectedMedia.length > 0 ? (
                        <div className={ selectedMedia.length === 0 ? "hidden" : "flex"}>
                            <Tooltip content="Eliminar seleccionados">
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
                            onClick={() => router.push(`/slides/edit/${slide}/media/create`)}
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
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 p-2 text-gray-500 dark:border-gray-800 dark:text-gray-400">
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
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        <Checkbox
                                            checked={selectedMedia.length === media.length}
                                            onChange={(checked) =>
                                                setSelectedMedia(checked ? media.map((item) => item.id) : [])
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slide ID</TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audio</TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 z-10">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white divide-y divide-gray-200">
                                {paginatedMedia.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Checkbox
                                                checked={selectedMedia.includes(item.id)}
                                                onChange={() => toggleSelectMedia(item.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.slide_id}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.type === "image" ? (
                                                <div className="w-16 h-16 border rounded overflow-hidden">
                                                    <img 
                                                        src={FTP_BASE_URL + item.file_path} 
                                                        alt="Image preview" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <MdVideoFile size={24} className="text-blue-500 mr-2" />
                                                    <span>Video</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.audio_path ? (
                                                <div className="flex items-center">
                                                    <MdAudioFile size={24} className="text-green-500 mr-2" />
                                                    <span>Audio</span>
                                                </div>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.duration}s</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap relative sticky right-0 bg-white z-10">
                                            <div className="flex gap-2 justify-end">
                                                <Tooltip content="Ver Detalles">
                                                    <Button
                                                        onClick={() => handleViewDetails(item.id)}
                                                        variant="primary"
                                                        size="sm"
                                                    >
                                                        <MdInfo size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Editar">
                                                    <Button
                                                        onClick={() => handleEdit(item.id)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <MdEdit size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Eliminar">
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
                                        label: `${value} items per page`
                                    }))}
                                    placeholder="Select items per page"
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
