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
import {MdDelete, MdEdit} from "react-icons/md";
import Tooltip from "@/components/ui/tooltip/Tooltip";
import {ChevronDownIcon} from "@/icons";
import { useRouter } from "next/navigation";
import { useMessage } from "@/context/MessageContext";
import ActionModal from "@/components/ui/modal/ActionModal";
import Cookies from "js-cookie";
import filterItems from "@/utils/filterItems";
import SearchInput from "@/components/tables/SearchInput";
import TableSkeleton from "@/components/tables/TableSkeleton";
import EmptyState from "@/components/tables/EmptyState";
import useDebounce from "@/hooks/useDebounce";
import { useT } from "@/i18n/I18nProvider";


const UserTable = () => {
    const router = useRouter();
    const tCommon = useT("common.buttons");
    const tTable = useT("common.table");
    const tHeaders = useT("common.table.headers");
    const tActions = useT("common.table.actions");
    const tFilters = useT("common.table.filters");
    const tStatus = useT("status");
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [authenticatedUserId, setAuthenticatedUserId] = useState<any>(null);
    const setError = useError().setError;
    const setMessage = useMessage().setMessage;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchUsers();
                setUsers(data);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error al iniciar sesión");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [setUsers, setError]);

    useEffect(() => {
        const fetchAuthenticatedUserId = async () => {
            const userId: any = Cookies.get("user");
            setAuthenticatedUserId(userId.id);
        };

        fetchAuthenticatedUserId();
    }, []);

    const toggleSelectUser = (id: any) => {
        setSelectedUsers((prev) =>
            prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
        );
    };

    const deleteSelectedUsers = async () => {
        setIsWarningModalOpen(true);
    };

    const openWarningModal = (userId: any) => {
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
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error al eliminar usuario");
            } finally {
                setIsWarningModalOpen(false);
            }
        }
    };

    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const filteredUsers = filterItems(users, debouncedSearchTerm).filter(
        (user: { id: null; }) => user.id !== authenticatedUserId
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleEdit = (userId: any) => {
        router.push(`/users/edit/${userId}`);
    };

    // const handleActivateDevice = (userId) => {
    //     router.push(`/activate/${userId}`);
    // };

    return (
        <>
            <ActionModal
                isOpen={isWarningModalOpen}
                onClose={() => setIsWarningModalOpen(false)}
                title={tTable("modals.delete.title")}
                message={tTable("modals.delete.message")}
                actions={[
                    { label: tCommon("cancel"), onClick: () => setIsWarningModalOpen(false) },
                    { label: tCommon("delete"), onClick: confirmDeleteUser, variant: "primary" },
                ]}
            />
            <div>
                <div className="flex items-center justify-between mb-4">
                    { selectedUsers.length > 0 ? (
                            <div className={ selectedUsers.length === 0 ? "hidden" : "flex"}>
                                <Tooltip content={tActions("delete")}>
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
                        <span className="hidden sm:block">{tCommon("add")}</span>
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
                    <TableSkeleton columns={8} />
                ) : paginatedUsers.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableCell isHeader>
                                        <Checkbox
                                            checked={selectedUsers.length === users.length}
                                            onChange={(checked) =>
                                                setSelectedUsers(checked ? users.map((user) => user.id) : [])
                                            }
                                        />
                                    </TableCell>
                                    <TableCell isHeader>{tHeaders("id")}
                                    </TableCell>
                                    <TableCell isHeader>{tHeaders("name")}
                                    </TableCell>
                                    <TableCell isHeader>{tHeaders("email")}
                                    </TableCell>
                                    <TableCell isHeader>{tHeaders("phone")}
                                    </TableCell>
                                    <TableCell isHeader>{tHeaders("status")}
                                    </TableCell>
                                    <TableCell isHeader>{tHeaders("role")}
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="text-right sticky right-0 bg-surface-sunken z-10">
                                        {tHeaders("actions")}
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedUsers.map((user: any) => (
                                    <TableRow key={user.id} className={user.enabled ? "" : "bg-error-50 dark:bg-error-500/10"}>
                                        <TableCell className="whitespace-nowrap">
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => toggleSelectUser(user.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {user.id}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-content-primary">
                                            {user.name}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {user.email}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {user.phone || "N/A"}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {user.enabled ? tStatus("enabled") : tStatus("disabled")}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {user.role}
                                        </TableCell>
                                        <TableCell
                                            className="whitespace-nowrap relative sticky right-0 bg-surface z-10 group-hover:bg-surface-hover">
                                            <div className="flex gap-2 justify-end">
                                                <Tooltip content={tActions("edit")}>
                                                    <Button
                                                        onClick={() => handleEdit(user.id)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <MdEdit size={18}/>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content={tActions("delete")}>
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
                        <span className="absolute text-content-muted -translate-y-1/2 pointer-events-none right-3 top-1/2">
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
