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
import {fetchUsers, deleteUsersAPI} from "@/server/api/users";
import Pagination from "../../../tables/Pagination";
import Select from "../../../form/Select";
import config from "@/config/globalConfig";
import Input from "@/components/form/input/InputField";
import {MdSearch, MdDelete, MdEdit, MdDevices} from "react-icons/md";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import {ChevronDownIcon} from "@/icons";
import { useRouter } from "next/navigation";
import { useMessage } from "@/context/MessageContext";
import ActionModal from "@/components/ui/modal/ActionModal";
import Cookies from "js-cookie";
import filterItems from "@/utils/filterItems";


const UserTable = () => {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [authenticatedUserId, setAuthenticatedUserId] = useState(null);
    const setError = useError().setError;
    const setMessage = useMessage().setMessage;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchUsers();
                setUsers(data);
            } catch (err) {
                setError(err.data?.message || err.message || "Error al iniciar sesión");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchAuthenticatedUserId = async () => {
            const userId = Cookies.get("user").id;
            setAuthenticatedUserId(userId);
        };

        fetchAuthenticatedUserId();
    }, []);

    const toggleSelectUser = (id) => {
        setSelectedUsers((prev) =>
            prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
        );
    };

    const deleteSelectedUsers = async () => {
        setIsWarningModalOpen(true);
    };

    const openWarningModal = (userId) => {
        setSelectedUsers([userId])
        setIsWarningModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (selectedUsers.length > 0) {
            try {
                const response = await deleteUsersAPI(selectedUsers);
                setUsers((prev) => prev.filter((user) => !selectedUsers.includes(user.id)));
                setSelectedUsers([]);
                setMessage(response.message);
            } catch (err) {
                setError(err.data?.message || err.message || "Error al eliminar usuario");
            } finally {
                setIsWarningModalOpen(false);
                setUserToDelete(null);
            }
        }
    };

    const filteredUsers = filterItems(users, searchTerm).filter(
        (user) => user.id !== authenticatedUserId
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleEdit = (userId) => {
        router.push(`/users/edit/${userId}`);
    };

    const handleActivateDevice = (userId) => {
        router.push(`/activate/${userId}`);
    };

    return (
        <>
            <ActionModal
                isOpen={isWarningModalOpen}
                onClose={() => setIsWarningModalOpen(false)}
                title="Warning"
                message="¿Estás seguro de que deseas eliminar este usuario?"
                actions={[
                    { label: "Cancelar", onClick: () => setIsWarningModalOpen(false) },
                    { label: "Eliminar", onClick: confirmDeleteUser, variant: "danger" },
                ]}
            />
            <div>
                <div className="flex items-center justify-between mb-4">
                    { selectedUsers.length > 0 ? (
                            <div className={ selectedUsers.length === 0 ? "hidden" : "flex"}>
                                <Tooltip content="Delete Selected Users">
                                    <Button
                                        size="sm"
                                        onClick={deleteSelectedUsers}
                                        disabled={selectedUsers.length === 0}
                                        variant="danger"
                                    >
                                        <MdDelete size={20}/>
                                    </Button>
                                </Tooltip>
                            </div>
                        ) : (
                            <Button
                        onClick={() => {
                            window.location.href = "/users/create";
                        }}
                        variant="primary"
                        size="sm"
                        className="mb-2 sm:mb-0 sm:w-auto"
                    >
                        <span className="hidden sm:block">+ Adicionar usuario</span>
                        <span className="block sm:hidden">+</span>
                    </Button>
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

                {loading ? (
                    <div>Loading...</div>
                ) : paginatedUsers.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No hay usuarios para mostrar.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full divide-y divide-gray-200">
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        <Checkbox
                                            checked={selectedUsers.length === users.length}
                                            onChange={(checked) =>
                                                setSelectedUsers(checked ? users.map((user) => user.id) : [])
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        ID
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Name
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Email
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Phone
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Role
                                    </TableCell>
                                    <TableCell
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 z-10">
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white divide-y divide-gray-200">
                                {paginatedUsers.map((user) => (
                                    <TableRow key={user.id} className={user.enabled ? "" : "bg-red-100"}>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => toggleSelectUser(user.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.id}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.name}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.email}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.phone || "N/A"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.enabled ? "Enabled" : "Disabled"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.role}
                                        </TableCell>
                                        <TableCell
                                            className="px-6 py-4 whitespace-nowrap relative sticky right-0 bg-white z-10">
                                            <div className="flex gap-2 justify-end">
                                                <Tooltip content="Editar">
                                                    <Button
                                                        onClick={() => handleEdit(user.id)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <MdEdit size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Activate Device">
                                                    <Button
                                                        onClick={() => handleActivateDevice(user.id)}
                                                        variant="primary"
                                                        size="sm"
                                                    >
                                                        <MdDevices size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Eliminar">
                                                    <Button
                                                        onClick={() => openWarningModal(user.id)}
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
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
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

export default UserTable;
