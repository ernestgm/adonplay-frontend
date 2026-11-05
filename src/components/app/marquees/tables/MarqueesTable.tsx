"use client";
import React, {useState, useEffect} from "react";
import {ChevronDownIcon} from "@/icons";
import {fetchMarquees, deleteMarquees} from "@/server/api/marquees";
import {useRouter} from "next/navigation";
import Button from "@/components/ui/button/Button";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import ActionModal from "@/components/ui/modal/ActionModal";
import {useError} from "@/context/ErrorContext";
import {useMessage} from "@/context/MessageContext";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import Checkbox from "@/components/form/input/Checkbox";
import {MdDelete, MdEdit} from "react-icons/md";
import Select from "@/components/form/Select";
import config from "@/config/globalConfig";
import Pagination from "@/components/tables/Pagination";
import SearchInput from "@/components/tables/SearchInput";
import TableSkeleton from "@/components/tables/TableSkeleton";
import EmptyState from "@/components/tables/EmptyState";
import useDebounce from "@/hooks/useDebounce";
import filterItems from "@/utils/filterItems";
import { useT } from "@/i18n/I18nProvider";

const MarqueesTable = () => {
    const router = useRouter();
    const tCommon = useT("common.buttons");
    const tTable = useT("common.table");
    const tHeaders = useT("common.table.headers");
    const tActions = useT("common.table.actions");
    const tFilters = useT("common.table.filters");
    const setError = useError().setError;
    const setMessage = useMessage().setMessage;
    const [marquees, setMarquees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [selectedMarquee, setSelectedMarquee] = useState<number[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchMarquees();
                setMarquees(data);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error al cargar marquees");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setError]);

    const handleEdit = (marquee: any) => {
        router.push(`/marquees/edit/${marquee}`);
    };

    const deleteSelectedMarquees = async () => {
        setIsWarningModalOpen(true);
    };
    const toggleSelectMarquees = (id: number) => {
        setSelectedMarquee((prev) =>
            prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
        );
    };
    const openWarningModal = (marquee: number) => {
        setSelectedMarquee([marquee]);
        setIsWarningModalOpen(true);
    };

    const confirmDeleteMarquees = async () => {
        if (selectedMarquee.length > 0) {
            try {
                const response = await deleteMarquees(selectedMarquee);
                setMarquees((prev) => prev.filter((b) => !selectedMarquee.includes(b.id)));
                setSelectedMarquee([]);
                setMessage(response.message);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error al eliminar negocio");
            } finally {
                setIsWarningModalOpen(false);
            }
        }
    };

    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const filteredMarquees = filterItems(marquees, debouncedSearchTerm);

    // PAGINACIÓN
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const paginatedMarquees = filteredMarquees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredMarquees.length / itemsPerPage);

    return (
        <div>
            <ActionModal
                isOpen={isWarningModalOpen}
                onClose={() => setIsWarningModalOpen(false)}
                actions={[
                    {label: tCommon("cancel"), onClick: () => setIsWarningModalOpen(false)},
                    {label: tCommon("delete"), onClick: confirmDeleteMarquees, variant: "primary"},
                ]}
                title={tTable("modals.delete.title")}
                message={tTable("modals.delete.message")}
            />

            <div className="flex items-center justify-between mb-4">
                {selectedMarquee.length > 0 ? (
                    <div className={selectedMarquee.length === 0 ? "hidden" : "flex"}>
                        <Tooltip content={tActions("delete")}>
                            <Button
                                size="sm"
                                onClick={deleteSelectedMarquees}
                                disabled={selectedMarquee.length === 0}
                                variant="danger"
                            >
                                <MdDelete size={20}/>
                            </Button>
                        </Tooltip>
                    </div>
                ) : (
                    <Button
                        onClick={() => {
                            window.location.href = "/marquees/create";
                        }}
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
                <TableSkeleton columns={5} />
            ) : paginatedMarquees.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableCell isHeader>
                                    <Checkbox
                                        checked={selectedMarquee.length === marquees.length && marquees.length > 0}
                                        onChange={(checked) => setSelectedMarquee(checked ? marquees.map((b) => b.id) : [])}
                                    />
                                </TableCell>
                                <TableCell isHeader>{tHeaders("name")}</TableCell>
                                <TableCell isHeader>{tHeaders("business")}</TableCell>
                                <TableCell isHeader>{tHeaders("preview")}</TableCell>
                                <TableCell isHeader className="text-right sticky right-0 bg-surface-sunken z-10">{tHeaders("actions")}</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedMarquees.map((m: any) => (
                                <TableRow key={m.id}>
                                    <TableCell className="whitespace-nowrap">
                                        <Checkbox
                                            checked={selectedMarquee.includes(m.id)}
                                            onChange={() => toggleSelectMarquees(m.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-content-primary">{m.name}</TableCell>
                                    <TableCell className="whitespace-nowrap">{m.business?.name || '-'}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        <span style={{
                                            background: m.background_color,
                                            color: m.text_color,
                                            padding: '2px 8px',
                                            borderRadius: '4px'
                                        }}>
                                            {m.message}
                                        </span>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap relative sticky right-0 bg-surface z-10 group-hover:bg-surface-hover">
                                        <div className="flex gap-2 justify-end">
                                            <Tooltip content={tActions("edit")}>
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(m.id)}>
                                                    <MdEdit size={18}/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content={tActions("delete")}>
                                                <Button
                                                    onClick={() => openWarningModal(m.id)}
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
    );
};

export default MarqueesTable;
