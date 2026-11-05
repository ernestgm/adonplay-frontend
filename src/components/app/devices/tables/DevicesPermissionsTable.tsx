"use client";

import React, {useState, useEffect} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../ui/table";

import {useError} from "@/context/ErrorContext";
import Pagination from "../../../tables/Pagination";
import Select from "../../../form/Select";
import config from "@/config/globalConfig";
import {MdDelete} from "react-icons/md";
import {ChevronDownIcon} from "@/icons";
import {useMessage} from "@/context/MessageContext";
import filterItems from "@/utils/filterItems";
import SearchInput from "@/components/tables/SearchInput";
import TableSkeleton from "@/components/tables/TableSkeleton";
import EmptyState from "@/components/tables/EmptyState";
import useDebounce from "@/hooks/useDebounce";
import {
    deleteDevicePermissions,
    deleteDevicesAPI,
    fetchDevicesPermissions,
    updateDevicePermissions
} from "@/server/api/devices";
import Switch from "@/components/form/switch/Switch";
import { useT } from "@/i18n/I18nProvider";
import Button from "@/components/ui/button/Button";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import ActionModal from "@/components/ui/modal/ActionModal";


type DevicePermissionItem = {
    id: number;
    device_id: string;
    code: string;
    registered: boolean;
} & Record<string, unknown>;

const DevicesPermissionsTable = () => {
    const tCommon = useT("common.buttons");
    const tActions = useT("common.table.actions");
    const tTable = useT("common.table");
    const tHeaders = useT("common.table.headers");
    const tFilters = useT("common.table.filters");
    const [devices, setDevices] = useState<DevicePermissionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const setError = useError().setError;
    const setMessage = useMessage().setMessage;
    const [selectedDevice, setSelectedDevice] = useState<number>();
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchDevicesPermissions();
                setDevices(data as DevicePermissionItem[]);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSwitchChange = async (checked: boolean, id: number) => {
        try {
            const formData = new FormData();
            formData.append("registered", checked ? "true" : "false");
            const response = await updateDevicePermissions(id, formData);
            setMessage(response.message);
        } catch (err: any) {
            setError(err.data?.message || err.message || "Error");
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const filteredDevices = filterItems(devices, debouncedSearchTerm)

    const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
    const paginatedDevices = filteredDevices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const openWarningModal = (deviceId: number) => {
        setSelectedDevice(deviceId)
        setIsWarningModalOpen(true);
    };

    const confirmDeleteDevices = async () => {
        if (selectedDevice !== undefined && selectedDevice !== null && selectedDevice > 0) {
            try {
                const response = await deleteDevicePermissions(selectedDevice);
                setDevices((prev) => prev.filter((device) => device.id !== selectedDevice));
                setMessage(response.message);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error al eliminar Devices");
            } finally {
                setIsWarningModalOpen(false);
            }
        }
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
                    {label: tCommon("delete"), onClick: confirmDeleteDevices, variant: "primary"},
                ]}
            />
            <div>
                <div className="flex items-center justify-between mb-4">
                    <SearchInput
                        value={searchTerm}
                        onChange={(value) => {
                            setSearchTerm(value);
                            setCurrentPage(1);
                        }}
                        placeholder={tFilters("searchPlaceholder")}
                    />
                </div>

                { loading ? (
                    <TableSkeleton columns={4} />
                ) : paginatedDevices.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>
                                        {tHeaders("deviceId")}
                                    </TableCell>
                                    <TableCell isHeader>
                                        {tHeaders("code")}
                                    </TableCell>
                                    <TableCell isHeader>
                                        {tHeaders("active")}
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="text-right sticky right-0 bg-surface-sunken z-10">
                                        {tHeaders("actions")}
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedDevices.map((device: any) => (
                                    <TableRow key={device.id}>
                                        <TableCell className="whitespace-nowrap text-content-primary">
                                            {device.device_id}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-content-primary">
                                            {device.code}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-content-primary">
                                            {device.active ? tTable("yes") : tTable("no")}
                                        </TableCell>
                                        <TableCell
                                            className="whitespace-nowrap relative sticky right-0 bg-surface z-10 group-hover:bg-surface-hover">
                                            <div className="flex gap-2 justify-end">
                                                <Switch
                                                    id={device.id}
                                                    label=""
                                                    defaultChecked={device.registered}
                                                    onChange={handleSwitchChange}
                                                />
                                                {!device.active && (
                                                    <Tooltip content={tActions("delete")}>
                                                        <Button
                                                            onClick={() => openWarningModal(device.id)}
                                                            variant="danger"
                                                            size="sm"
                                                        >
                                                            <MdDelete size={18}/>
                                                        </Button>
                                                    </Tooltip>
                                                )
                                                }
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

export default DevicesPermissionsTable;
