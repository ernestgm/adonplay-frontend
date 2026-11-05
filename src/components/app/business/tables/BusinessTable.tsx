"use client";

import React, {useState, useEffect} from "react";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import {useError} from "@/context/ErrorContext";
import {fetchBusinesses, deleteBusinessesAPI} from "@/server/api/business";
import Pagination from "../../../tables/Pagination";
import Select from "@/components/form/Select";
import config from "@/config/globalConfig";
import {MdDelete, MdEdit} from "react-icons/md";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import SearchInput from "@/components/tables/SearchInput";
import TableSkeleton from "@/components/tables/TableSkeleton";
import EmptyState from "@/components/tables/EmptyState";
import useDebounce from "@/hooks/useDebounce";
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
import { useT } from "@/i18n/I18nProvider";

const BusinessTable = () => {
    const tCommon = useT("common.buttons");
    const tTable = useT("common.table");
    const tHeaders = useT("common.table.headers");
    const tActions = useT("common.table.actions");
    const tFilters = useT("common.table.filters");
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

    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const filteredBusinesses = filterItems(businesses, debouncedSearchTerm);
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
                title={tTable("modals.delete.title")}
                message={tTable("modals.delete.message")}
                actions={[
                    {label: tCommon("cancel"), onClick: () => setIsWarningModalOpen(false)},
                    {label: tCommon("delete"), onClick: confirmDeleteBusiness, variant: "primary"},
                ]}
            />
            <div>
                <div className="flex items-center justify-between mb-4">
                    {selectedBusinesses.length > 0 ? (
                        !isOwner && (
                            <div className={selectedBusinesses.length === 0 ? "hidden" : "flex"}>
                                <Tooltip content={tActions("delete")}>
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
                        )
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
                                <span className="hidden sm:block">{tCommon("create")}</span>
                                <span className="block sm:hidden">+</span>
                            </Button>
                        )
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
                                    <TableCell isHeader className="w-12">
                                        <Checkbox
                                            checked={selectedBusinesses.length === businesses.length && businesses.length > 0}
                                            onChange={(checked) => setSelectedBusinesses(checked ? businesses.map((b) => b.id) : [])}
                                        />
                                    </TableCell>
                                    <TableCell isHeader>{tHeaders("name")}</TableCell>
                                    <TableCell isHeader>{tHeaders("description")}</TableCell>
                                    <TableCell isHeader>{tHeaders("owner")}</TableCell>
                                    <TableCell isHeader className="text-right sticky right-0 bg-surface-sunken z-10">{tHeaders("actions")}</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedBusinesses.map((business: any) => (
                                    <TableRow key={business.id}>
                                        <TableCell className="whitespace-nowrap">
                                            <Checkbox
                                                checked={selectedBusinesses.includes(business.id)}
                                                onChange={() => toggleSelectBusiness(business.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-content-primary">{business.name}</TableCell>
                                        <TableCell className="whitespace-nowrap">{business.description}</TableCell>
                                        <TableCell className="whitespace-nowrap">{business.owner?.name || ""}</TableCell>
                                        <TableCell className="whitespace-nowrap relative sticky right-0 bg-surface z-10 group-hover:bg-surface-hover">
                                            <div className="flex gap-2 justify-end">
                                                <Tooltip content={tActions("edit")}>
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(business.id)}>
                                                        <MdEdit size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                {!isOwner && (
                                                    <Tooltip content={tActions("delete")}>
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

export default BusinessTable;
