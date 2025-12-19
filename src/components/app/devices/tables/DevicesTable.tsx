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
import Pagination from "../../../tables/Pagination";
import Select from "../../../form/Select";
import config from "@/config/globalConfig";
import Input from "@/components/form/input/InputField";
import {MdSearch, MdDelete, MdEdit} from "react-icons/md";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import {ChevronDownIcon} from "@/icons";
import {useRouter} from "next/navigation";
import {useMessage} from "@/context/MessageContext";
import ActionModal from "@/components/ui/modal/ActionModal";
import filterItems from "@/utils/filterItems";
import {deleteDevicesAPI, fetchDevices} from "@/server/api/devices";
import {useStatusActionsChannel} from "@/websockets/channels/statusActionsChannel";
import OnlineBadge from "@/components/ui/badge/OnlineBadge";


type Device = { id: number } & Record<string, unknown>;

const DevicesTable = () => {
    const router = useRouter();
    const [devices, setDevices] = useState<Device[]>([]);
    const [devicesOnline, setDevicesOnline] = useState<string[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
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
                const data = await fetchDevices();
                setDevices(data as Device[]);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error!!!");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const deleteSelectedDevices = async () => {
        setIsWarningModalOpen(true);
    };

    const openWarningModal = (deviceId: number) => {
        setSelectedDevices([deviceId])
        setIsWarningModalOpen(true);
    };

    const confirmDeleteDevices = async () => {
        if (selectedDevices.length > 0) {
            try {
                const response = await deleteDevicesAPI(selectedDevices);
                setDevices((prev) => prev.filter((device) => !selectedDevices.includes(device.id)));
                setSelectedDevices([]);
                setMessage(response.message);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error al eliminar Devices");
            } finally {
                setIsWarningModalOpen(false);
            }
        }
    };

    const toggleSelectDevices = (id: number) => {
        setSelectedDevices((prev) =>
            prev.includes(id) ? prev.filter((deviceId) => deviceId !== id) : [...prev, id]
        );
    };

    const filteredDevices = filterItems(devices, searchTerm)

    const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
    const paginatedDevices = filteredDevices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleEdit = (deviceId: number | string) => {
        router.push(`/devices/edit/${deviceId}`);
    };

    useStatusActionsChannel("frontend", (data) => {
        if (data && typeof data === 'object' && 'devices' in data) {
            const value = (data as { devices?: unknown }).devices;
            if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
                setDevicesOnline(value as string[]);
            }
        }
    })

    return (
        <>
            <ActionModal
                isOpen={isWarningModalOpen}
                onClose={() => setIsWarningModalOpen(false)}
                title="Warning"
                message="¿Estás seguro de que deseas eliminar este Device?"
                actions={[
                    {label: "Cancelar", onClick: () => setIsWarningModalOpen(false)},
                    {label: "Eliminar", onClick: confirmDeleteDevices, variant: "primary"},
                ]}
            />
            <div>
                <div className="flex items-center justify-between mb-4">
                    {selectedDevices.length > 0 && (
                        <div className={selectedDevices.length === 0 ? "hidden" : "flex"}>
                            <Tooltip content="Delete Selected Devices">
                                <Button
                                    size="sm"
                                    onClick={deleteSelectedDevices}
                                    disabled={selectedDevices.length === 0}
                                    variant="danger"
                                >
                                    <MdDelete size={20}/>
                                </Button>
                            </Tooltip>
                        </div>
                    )}

                    <div className="relative">
                        <Input
                            placeholder="Search..."
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

                { loading ? (
                    <div>Loading...</div>
                ) : paginatedDevices.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No hay Devices para mostrar.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full divide-y divide-gray-200">
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        <Checkbox
                                            checked={selectedDevices.length === devices.length}
                                            onChange={(checked) =>
                                                setSelectedDevices(checked ? devices.map((device) => device.id) : [])
                                            }
                                        />
                                    </TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        User
                                    </TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Device ID
                                    </TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Name
                                    </TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Slide
                                    </TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        QR
                                    </TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Marquee
                                    </TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 z-10">
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white divide-y divide-gray-200">
                                {paginatedDevices.map((device: any) => (
                                    <TableRow key={device.id}>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Checkbox
                                                checked={selectedDevices.includes(device.id)}
                                                onChange={() => toggleSelectDevices(device.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            { device.user?.name || "-" }
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <OnlineBadge devices={devicesOnline} deviceId={device.device_id} />
                                                { device.device_id || "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {device.name}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            { device.slide?.name || "-" }
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {device.qr?.name || "-"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {device.marquee?.name || "-"}
                                        </TableCell>
                                        <TableCell
                                            className="px-6 py-4 whitespace-nowrap relative sticky right-0 bg-white z-10">
                                            <div className="flex gap-2 justify-end">
                                                <Tooltip content="Editar">
                                                    <Button
                                                        onClick={() => handleEdit(device.id)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <MdEdit size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Eliminar">
                                                    <Button
                                                        onClick={() => openWarningModal(device.id)}
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

export default DevicesTable;
