"use client";

import React, {useState, useEffect} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../ui/table";

import Button from "@/components/ui/button/Button";
import {useError} from "@/context/ErrorContext";
import Pagination from "../../../tables/Pagination";
import Select from "../../../form/Select";
import config from "@/config/globalConfig";
import {MdEdit} from "react-icons/md";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import SearchInput from "@/components/tables/SearchInput";
import TableSkeleton from "@/components/tables/TableSkeleton";
import EmptyState from "@/components/tables/EmptyState";
import useDebounce from "@/hooks/useDebounce";
import {ChevronDownIcon} from "@/icons";
import {useRouter} from "next/navigation";
import filterItems from "@/utils/filterItems";
import {fetchDevices} from "@/server/api/devices";
import {useStatusActionsChannel} from "@/websockets/channels/statusActionsChannel";
import OnlineBadge from "@/components/ui/badge/OnlineBadge";
import {useT} from "@/i18n/I18nProvider";
import {PiMonitorPlayFill} from "react-icons/pi";
import {getIsOwner} from "@/server/api/auth";

const DevicesTable = () => {
    const tHeaders = useT("common.table.headers");
    const tActions = useT("common.table.actions");
    const tFilters = useT("common.table.filters");
    const router = useRouter();
    const [devices, setDevices] = useState<any[]>([]);
    const [devicesOnline, setDevicesOnline] = useState<string[]>([]);
    const [filterDevicesOnline, setFilterDevicesOnline] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const setError = useError().setError;
    const isOwner = getIsOwner()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchDevices();
                setDevices(data as any[]);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error!!!");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const filteredDevices = filterItems(devices, debouncedSearchTerm)

    const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
    const paginatedDevices = filteredDevices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleEdit = (deviceId: number | string) => {
        router.push(`/devices/edit/${deviceId}`);
    };

    useEffect(() => {
        const filteredDevicesOnline = devicesOnline.filter(deviceOnline => devices.find(device => device.device_id === deviceOnline));
        setFilterDevicesOnline(filteredDevicesOnline)
    }, [devicesOnline]);

    useStatusActionsChannel("frontend", (data) => {
        if (data && typeof data === 'object' && 'devices' in data) {
            const value = (data as { devices?: unknown }).devices;
            if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
                setDevicesOnline(value as string[]);
            }
        }
    }, () => {
        setDevicesOnline([])
    })

    return (
        <>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="bg-surface p-6 rounded-2xl border border-line shadow-theme-xs border-l-4 border-l-success-500">
                            <div className="flex items-center">
                                <div className="p-3 bg-success-100 dark:bg-success-500/15 rounded-full">
                                    <div className="w-6 h-6 text-success-600 dark:text-success-400">
                                        <PiMonitorPlayFill size={25}/>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-content-secondary">
                                        {tHeaders("devicesOn")}
                                    </p>
                                    <p className="text-3xl font-bold text-content-primary tabular-nums">
                                        { !isOwner ? Math.round(devicesOnline.length) : Math.round(filterDevicesOnline.length) }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface p-6 rounded-2xl border border-line shadow-theme-xs border-l-4 border-l-error-500">
                            <div className="flex items-center">
                                <div className="p-3 bg-error-100 dark:bg-error-500/15 rounded-full">
                                    <div className="w-6 h-6 text-error-600 dark:text-error-400" >
                                        <PiMonitorPlayFill size={25}/>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-content-secondary">
                                        {tHeaders("devicesOff")}
                                    </p>
                                    {
                                        isOwner ? (
                                            <p className="text-3xl font-bold text-content-primary tabular-nums">
                                                {Math.round(devices.length - filterDevicesOnline.length)}
                                            </p>
                                        ) : (
                                            <p className="text-3xl font-bold text-content-primary tabular-nums">
                                                {Math.round(devices.length - devicesOnline.length)}
                                            </p>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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

                {loading ? (
                    <TableSkeleton columns={8} />
                ) : paginatedDevices.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>
                                        {tHeaders("status")}
                                    </TableCell>
                                    <TableCell isHeader>
                                        {tHeaders("user")}
                                    </TableCell>
                                    <TableCell isHeader>
                                        {tHeaders("deviceId")}
                                    </TableCell>
                                    <TableCell isHeader>
                                        {tHeaders("name")}
                                    </TableCell>
                                    <TableCell isHeader>
                                        {tHeaders("slide")}
                                    </TableCell>
                                    <TableCell isHeader>
                                        {tHeaders("qr")}
                                    </TableCell>
                                    <TableCell isHeader>
                                        {tHeaders("marquee")}
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
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <OnlineBadge
                                                    icon={<PiMonitorPlayFill size={30}/>}
                                                    devices={devicesOnline}
                                                    deviceId={device.device_id}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {device.user?.name || "-"}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-content-primary">
                                            <div className="flex items-center gap-2">
                                                {device.device_id || "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-content-primary">
                                            {device.name}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {device.slide?.name || "-"}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {device.qr?.name || "-"}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {device.marquee?.name || "-"}
                                        </TableCell>
                                        <TableCell
                                            className="whitespace-nowrap relative sticky right-0 bg-surface z-10 group-hover:bg-surface-hover">
                                            <div className="flex gap-2 justify-end">
                                                <Tooltip content={tActions("edit")}>
                                                    <Button
                                                        onClick={() => handleEdit(device.id)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <MdEdit size={18}/>
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
                                        label: tFilters("itemsPerPageOption", {n: value})
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

export default DevicesTable;
