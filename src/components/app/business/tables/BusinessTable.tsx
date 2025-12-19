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
import {getIsOwner} from "@/server/api/auth";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import filterItems from "@/utils/filterItems";

const BusinessTable = () => {
    const isOwner = getIsOwner()
    const router = useRouter();
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [selectedBusinesses, setSelectedBusinesses] = useState<any[]>([]);
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
                const data = await fetchBusinesses();
                setBusinesses(data);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error al cargar negocios");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleSelectBusiness = (id: any) => {
        setSelectedBusinesses((prev) =>
            prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
        );
    };

    const deleteSelectedBusinesses = async () => {
        setIsWarningModalOpen(true);
    };

    const openWarningModal = (businessId: any) => {
        setSelectedBusinesses([businessId]);
        setIsWarningModalOpen(true);
    };

    const confirmDeleteBusiness = async () => {
        if (selectedBusinesses.length > 0) {
            try {
                const response = await deleteBusinessesAPI(selectedBusinesses);
                setBusinesses((prev) => prev.filter((b) => !selectedBusinesses.includes(b.id)));
                setSelectedBusinesses([]);
                setMessage(response.message);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error al eliminar negocio");
            } finally {
                setIsWarningModalOpen(false);
            }
        }
    };

    const filteredBusinesses = filterItems(businesses, searchTerm);
    const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
    const paginatedBusinesses = filteredBusinesses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleEdit = (businessId: any) => {
        router.push(`/business/edit/${businessId}`);
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
                    {label: "Eliminar", onClick: confirmDeleteBusiness, variant: "primary"},
                ]}
            />
            <div>
                <div className="flex items-center justify-between mb-4">
                    {selectedBusinesses.length > 0 ? (
                        <div className={selectedBusinesses.length === 0 ? "hidden" : "flex"}>
                            <Tooltip content="Eliminar negocios seleccionados">
                                <Button
                                    size="sm"
                                    onClick={deleteSelectedBusinesses}
                                    disabled={selectedBusinesses.length === 0}
                                    variant="danger"
                                >
                                    <MdDelete size={20}/>
                                </Button>
                            </Tooltip>
                        </div>
                    ) : (
                        !isOwner && (
                            <Button
                                onClick={() => {
                                    window.location.href = "/business/create";
                                }}
                                variant="primary"
                                size="sm"
                                className="mb-2 sm:mb-0 sm:w-auto"
                            >
                                <span className="hidden sm:block">+ Adicionar negocio</span>
                                <span className="block sm:hidden">+</span>
                            </Button>
                        )
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
                        <Table className="min-w-full divide-y divide-gray-200">
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        <Checkbox
                                            checked={selectedBusinesses.length === businesses.length && businesses.length > 0}
                                            onChange={(checked) => setSelectedBusinesses(checked ? businesses.map((b) => b.id) : [])}
                                        />
                                    </TableCell>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</TableCell>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</TableCell>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</TableCell>
                                    <TableCell isHeader className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 z-10">Acciones</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white divide-y divide-gray-200">
                                {paginatedBusinesses.map((business: any) => (
                                    <TableRow key={business.id}>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Checkbox
                                                checked={selectedBusinesses.includes(business.id)}
                                                onChange={() => toggleSelectBusiness(business.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{business.name}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{business.description}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{business.owner?.name || ""}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap relative sticky right-0 bg-white z-10">
                                            <div className="flex gap-2 justify-end">
                                                <Tooltip content="Editar">
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(business.id)}>
                                                        <MdEdit size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                {!isOwner && (
                                                    <Tooltip content="Eliminar">
                                                        <Button
                                                            onClick={() => openWarningModal(business.id)}
                                                            variant="danger"
                                                            size="sm"
                                                        >
                                                            <MdDelete size={18}/>
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
                                    className="border border-gray-300 rounded w-full sm:w-auto"
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

export default BusinessTable;
