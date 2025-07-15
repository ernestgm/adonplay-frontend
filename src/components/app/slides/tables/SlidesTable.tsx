"use client";

import React, {useState, useEffect} from "react";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import {useError} from "@/context/ErrorContext";
import {fetchBusinesses, deleteBusinessesAPI} from "@/server/api/business";
import Pagination from "../../../tables/Pagination";
import Select from "@/components/form/Select";
import config from "@/config/globalConfig";
import Input from "@/components/form/input/InputField";
import {MdSearch, MdDelete, MdEdit} from "react-icons/md";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import {ChevronDownIcon} from "@/icons";
import {useRouter} from "next/navigation";
import {useMessage} from "@/context/MessageContext";
import ActionModal from "@/components/ui/modal/ActionModal";
import {getDataUserAuth} from "@/server/api/auth";
import {fetchSlides} from "@/server/api/slides";

const SlidesTable = () => {
    const userData = getDataUserAuth();
    const isOwner = userData.roles?.some(r => r.code === "owner");
    const router = useRouter();
    const [slides, setSlides] = useState([]);
    const [selectedSlides, setSelectedSlides] = useState([]);
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
                const data = await fetchSlides();
                setSlides(data);
            } catch (err) {
                setError(err.data?.message || err.message || "Error al cargar negocios");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleSelectSlides = (id) => {
        setSelectedSlides((prev) =>
            prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
        );
    };

    const deleteSelectedSlides = async () => {
        setIsWarningModalOpen(true);
    };

    const openWarningModal = (businessId) => {
        setSelectedSlides([businessId]);
        setIsWarningModalOpen(true);
    };

    const confirmDeleteSlides = async () => {
        if (selectedSlides.length > 0) {
            try {
                const response = await deleteBusinessesAPI(selectedSlides);
                setSlides((prev) => prev.filter((b) => !selectedSlides.includes(b.id)));
                setMessage(response.message);
            } catch (err) {
                setError(err.data?.message || err.message || "Error al eliminar negocio");
            } finally {
                setIsWarningModalOpen(false);
            }
        }
    };

    const filterItems = (items, term) => {
        return items.filter((item) =>
            Object.keys(item).some((key) =>
                item[key]?.toString().toLowerCase().includes(term.toLowerCase())
            )
        );
    };

    const filteredBusinesses = filterItems(slides, searchTerm);
    const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
    const paginatedBusinesses = filteredBusinesses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleEdit = (businessId) => {
        router.push(`/slides/edit/${businessId}`);
    };

    return (
        <>
            <ActionModal
                isOpen={isWarningModalOpen}
                onClose={() => setIsWarningModalOpen(false)}
                title="Warning"
                message="¿Estás seguro de que deseas eliminar este negocio?"
                actions={[
                    {label: "Cancelar", onClick: () => setIsWarningModalOpen(false)},
                    {label: "Eliminar", onClick: confirmDeleteSlides, variant: "danger"},
                ]}
            />
            <div>
                <div className="flex items-center justify-between mb-4">
                    {selectedSlides.length > 0 ? (
                        <div className={selectedSlides.length === 0 ? "hidden" : "flex"}>
                            <Tooltip content="Eliminar negocios seleccionados">
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
                        <Button
                            onClick={() => {
                                window.location.href = "/slides/create";
                            }}
                            variant="primary"
                            size="sm"
                            className="mb-2 sm:mb-0 sm:w-auto"
                        >
                            <span className="hidden sm:block">+ Adicionar Slides</span>
                            <span className="block sm:hidden">+</span>
                        </Button>
                    )}
                    <div className="relative">
                        <Input
                            placeholder="Buscar..."
                            value={searchTerm}
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
                ) : paginatedBusinesses.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No hay negocios para mostrar.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    <Checkbox
                                        checked={selectedSlides.length === slides.length && slides.length > 0}
                                        onChange={(checked) =>
                                            setSelectedSlides(checked ? slides.map((b) => b.id) : [])
                                        }
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 z-10">Acciones</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedBusinesses.map((slides) => (
                                <tr key={slides.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <Checkbox
                                            checked={selectedSlides.includes(slides.id)}
                                            onChange={() => toggleSelectSlides(slides.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{slides.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slides.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slides.owner?.name || ""}</td>
                                    <td className="px-6 py-4 whitespace-nowrap relative sticky right-0 bg-white z-10">
                                        <div className="flex gap-2 justify-end">
                                            <Tooltip content="Editar">
                                                <Button
                                                    onClick={() => handleEdit(slides.id)}
                                                    variant="primary"
                                                    size="sm"
                                                >
                                                    <MdEdit size={18}/>
                                                </Button>
                                            </Tooltip>
                                            {!isOwner && (
                                                <Tooltip content="Eliminar">
                                                    <Button
                                                        onClick={() => openWarningModal(slides.id)}
                                                        variant="danger"
                                                        size="sm"
                                                    >
                                                        <MdDelete size={18}/>
                                                    </Button>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
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
                                    className="border border-gray-300 rounded py-1 w-full sm:w-auto"
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

export default SlidesTable;
