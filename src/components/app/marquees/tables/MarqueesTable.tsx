"use client";
import React, {useState, useEffect} from "react";
import {ChevronDownIcon} from "@/icons";
import {fetchMarquees, deleteMarquees} from "@/server/api/marquees";
import {useRouter} from "next/navigation";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import ActionModal from "@/components/ui/modal/ActionModal";
import {useError} from "@/context/ErrorContext";
import {useMessage} from "@/context/MessageContext";
import {Table, TableBody, TableCell, TableHeader, TableRow} from "@/components/ui/table";
import Checkbox from "@/components/form/input/Checkbox";
import {MdDelete, MdEdit, MdSearch} from "react-icons/md";
import Select from "@/components/form/Select";
import config from "@/config/globalConfig";
import Pagination from "@/components/tables/Pagination";
import filterItems from "@/utils/filterItems";
import { useT } from "@/i18n/I18nProvider";

const MarqueesTable = () => {
    const router = useRouter();
    const tCommon = useT("common.buttons");
    const tTable = useT("common.table");
    const tHeaders = useT("common.table.headers");
    const tActions = useT("common.table.actions");
    const tStates = useT("common.table.states");
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

    const filteredMarquees = filterItems(marquees, searchTerm);

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
                <div className="relative">
                    <Input
                        placeholder={tFilters("searchPlaceholder")}
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
                <div className="py-8 text-center text-gray-500">{tStates("loading")}</div>
            ) : paginatedMarquees.length === 0 ? (
                <div className="py-8 text-center text-gray-500">{tStates("empty")}</div>
            ) : (
                <div className="overflow-x-auto">
                    <Table className="min-w-full divide-y divide-gray-200">
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    <Checkbox
                                        checked={selectedMarquee.length === marquees.length && marquees.length > 0}
                                        onChange={(checked) => setSelectedMarquee(checked ? marquees.map((b) => b.id) : [])}
                                    />
                                </TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tHeaders("name")}</TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tHeaders("business")}</TableCell>
                                <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tHeaders("preview")}</TableCell>
                                <TableCell isHeader className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 z-10">{tHeaders("actions")}</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-white divide-y divide-gray-200">
                            {paginatedMarquees.map((m: any) => (
                                <TableRow key={m.id}>
                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <Checkbox
                                            checked={selectedMarquee.includes(m.id)}
                                            onChange={() => toggleSelectMarquees(m.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.name}</TableCell>
                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.business?.name || '-'}</TableCell>
                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span style={{
                                            background: m.background_color,
                                            color: m.text_color,
                                            padding: '2px 8px',
                                            borderRadius: '4px'
                                        }}>
                                            {m.message}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 whitespace-nowrap relative sticky right-0 bg-white z-10">
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
    );
};

export default MarqueesTable;
