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
import Input from "@/components/form/input/InputField";
import {MdSearch, MdDelete, MdEdit} from "react-icons/md";
import {ChevronDownIcon} from "@/icons";
import {useRouter} from "next/navigation";
import {useMessage} from "@/context/MessageContext";
import filterItems from "@/utils/filterItems";
import {fetchDevicesPermissions, updateDevicePermissions} from "@/server/api/devices";
import Switch from "@/components/form/switch/Switch";


const DevicesPermissionsTable = () => {
    const router = useRouter();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const setError = useError().setError;
    const setMessage = useMessage().setMessage;
    const [deviceToDelete, setDeviceToDelete] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchDevicesPermissions();
                setDevices(data);
            } catch (err) {
                setError(err.data?.message || err.message || "Error al iniciar sesión");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSwitchChange = async (checked: boolean, id: any) => {
        try {
            const formData = new FormData();
            formData.append("registered", checked ? "true" : "false");
            const response = await updateDevicePermissions(id, formData);
            setMessage(response.message);
        } catch (err) {
            setError(err.data?.message || err.message || "Error al Actualizar");
        } finally {
            setLoading(false);
        }
    };

    const filteredDevices = filterItems(devices, searchTerm)

    const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
    const paginatedDevices = filteredDevices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            <div>
                <div className="flex items-center justify-between mb-4">
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
                                        Device ID
                                    </TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Device Code
                                    </TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 z-10">
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white divide-y divide-gray-200">
                                {paginatedDevices.map((device) => (
                                    <TableRow key={device.id}>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {device.device_id}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {device.code}
                                        </TableCell>
                                        <TableCell
                                            className="px-6 py-4 whitespace-nowrap relative sticky right-0 bg-white z-10">
                                            <div className="flex gap-2 justify-end">
                                                <Switch
                                                    id={device.id}
                                                    label=""
                                                    defaultChecked={device.registered}
                                                    onChange={handleSwitchChange}
                                                />
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

export default DevicesPermissionsTable;
