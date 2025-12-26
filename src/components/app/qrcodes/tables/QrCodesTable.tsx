"use client";

import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../ui/table";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import { useError } from "@/context/ErrorContext";
import Pagination from "../../../tables/Pagination";
import Select from "../../../form/Select";
import config from "@/config/globalConfig";
import Input from "@/components/form/input/InputField";
import { MdSearch, MdDelete, MdEdit } from "react-icons/md";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import { ChevronDownIcon } from "@/icons";
import { useRouter } from "next/navigation";
import { useMessage } from "@/context/MessageContext";
import ActionModal from "@/components/ui/modal/ActionModal";
import filterItems from "@/utils/filterItems";
import {deleteQrCode, fetchQrCode} from "@/server/api/qrcodes";
import {QRCodeCanvas} from "qrcode.react";
import { useT } from "@/i18n/I18nProvider";

const QrCodesTable = () => {
    const tCommon = useT("common.buttons");
    const tTable = useT("common.table");
    const tHeaders = useT("common.table.headers");
    const tActions = useT("common.table.actions");
    const tStates = useT("common.table.states");
    const tFilters = useT("common.table.filters");
    const router = useRouter();
    const [qrcodes, setQrCodes] = useState<any[]>([]);
    const [selectedQrCodes, setSelectedQrCodes] = useState<any[]>([]);
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
                const data = await fetchQrCode();
                setQrCodes(data);
            } catch (err: any) {
                setError(err.message || "Error al obtener QRCodes");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleSelectQrCode = (id: any) => {
        setSelectedQrCodes((prev) =>
            prev.includes(id) ? prev.filter((qrId) => qrId !== id) : [...prev, id]
        );
    };

    const deleteSelectedQrCodes = async () => {
        setIsWarningModalOpen(true);
    };

    const openWarningModal = (qrId: any) => {
        setSelectedQrCodes([qrId]);
        setIsWarningModalOpen(true);
    };

    const confirmDeleteQrCode = async () => {
        if (selectedQrCodes.length > 0) {
            try {
                await deleteQrCode(selectedQrCodes);
                setQrCodes((prev) => prev.filter((qr) => !selectedQrCodes.includes(qr.id)));
                setSelectedQrCodes([]);
                setMessage("QRCodes eliminados correctamente");
            } catch (err: any) {
                setError(err.message || "Error al eliminar QRCodes");
            } finally {
                setIsWarningModalOpen(false);
            }
        }
    };

    const filteredQrCodes = filterItems(qrcodes, searchTerm);
    const totalPages = Math.ceil(filteredQrCodes.length / itemsPerPage);
    const paginatedQrCodes = filteredQrCodes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleEdit = (qrId: any) => {
        router.push(`/qrcodes/edit/${qrId}`);
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
                    { label: tCommon("delete"), onClick: confirmDeleteQrCode, variant: "primary" },
                ]}
            />
            <div>
                <div className="flex items-center justify-between mb-4">
                    {selectedQrCodes.length > 0 ? (
                        <div className={selectedQrCodes.length === 0 ? "hidden" : "flex"}>
                            <Tooltip content={tActions("delete")}>
                                <Button
                                    size="sm"
                                    onClick={deleteSelectedQrCodes}
                                    disabled={selectedQrCodes.length === 0}
                                    variant="danger"
                                >
                                    <MdDelete size={20} />
                                </Button>
                            </Tooltip>
                        </div>
                    ) : (
                        <Button
                            onClick={() => router.push("/qrcodes/create")}
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
                            <MdSearch size={20} />
                        </span>
                    </div>
                </div>
                {loading ? (
                    <div>{tStates("loading")}</div>
                ) : paginatedQrCodes.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">{tStates("empty")}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full divide-y divide-gray-200">
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        <Checkbox
                                            checked={selectedQrCodes.length === qrcodes.length && qrcodes.length > 0}
                                            onChange={(checked) =>
                                                setSelectedQrCodes(checked ? qrcodes.map((qr) => qr.id) : [])
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {tHeaders("name")}
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {tHeaders("info")}
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {tHeaders("preview")}
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {tHeaders("business")}
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 z-10">
                                        {tHeaders("actions")}
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white divide-y divide-gray-200">
                                {paginatedQrCodes.map((qr: any) => (
                                    <TableRow key={qr.id}>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Checkbox
                                                checked={selectedQrCodes.includes(qr.id)}
                                                onChange={() => toggleSelectQrCode(qr.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {qr.name}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {qr.info}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {
                                                <QRCodeCanvas
                                                    id="qrcode-canvas"
                                                    value={qr.info || []}
                                                    size={50}
                                                    level="H"
                                                    marginSize={1}
                                                />
                                            }
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {qr.business?.name || "-"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap relative sticky right-0 bg-white z-10">
                                            <div className="flex gap-2 justify-end">
                                                <Tooltip content={tActions("edit")}>
                                                    <Button
                                                        onClick={() => handleEdit(qr.id)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <MdEdit size={18} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content={tActions("delete")}>
                                                    <Button
                                                        onClick={() => openWarningModal(qr.id)}
                                                        variant="danger"
                                                        size="sm"
                                                    >
                                                        <MdDelete size={18} />
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
                                    <ChevronDownIcon />
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

export default QrCodesTable;
