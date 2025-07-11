"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { useError } from "@/context/ErrorContext";
import { fetchUsers } from "@/server/api/users";
import Pagination from "./Pagination";
import Select from "../form/Select";
import config from "@/config/globalConfig";
import Input from "@/components/form/input/InputField";
import { MdSearch, MdMenu, MdDelete } from "react-icons/md";


const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const setError = useError().setError;

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

  const toggleSelectUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const deleteSelectedUsers = () => {
    setUsers((prev) => prev.filter((user) => !selectedUsers.includes(user.id)));
    setSelectedUsers([]);
  };

  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const toggleDropdown = (id) => {
    setOpenDropdowns({ [id]: true });
  };

  const closeDropdown = (id) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  const filterItems = (items, term) => {
    return items.filter((item) =>
      Object.keys(item).some((key) =>
        item[key]?.toString().toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  const filteredUsers = filterItems(users, searchTerm);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button
            size="sm"
          onClick={deleteSelectedUsers}
          disabled={selectedUsers.length === 0}
          variant="danger"
          className="p-2 text-white bg-red-500 hover:bg-red-600"
        >
          <MdDelete size={20} />
        </Button>

        <div className="relative">
          <Input
              placeholder="Search..."
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
        <div>Loading...</div>
      ) : (
          <div className="table-auto md:table-fixed">
            <Table className="divide-y divide-gray-200 table-fixed">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Checkbox
                        checked={selectedUsers.length === users.length}
                        onChange={(checked) =>
                            setSelectedUsers(checked ? users.map((user) => user.id) : [])
                        }
                    />
                  </TableCell>
                  <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </TableCell>
                  <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </TableCell>
                  <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </TableCell>
                  <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </TableCell>
                  <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </TableCell>
                  <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </TableCell>
                  <TableCell
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50">
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
                        {user.roles.map((role) => role.name).join(", ")}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap relative sticky right-0 bg-white">
                        <div className="inline-block">
                          <Button
                              onClick={() => toggleDropdown(user.id)}
                              variant="outline"
                              size="sm"
                              className="p-1"
                          >
                            <MdMenu size={18}/>
                          </Button>
                          {openDropdowns[user.id] && (
                              <Dropdown
                                  isOpen={true}
                                  onClose={() => closeDropdown(user.id)}
                                  className="left-0"
                              >
                                <div className="absolute mt-2 left-0 bg-white shadow-md rounded-md p-2">
                                  <DropdownItem
                                      onClick={() => deleteUser(user.id)}
                                      className="text-red-500 hover:bg-red-100 px-4 py-2 rounded-md"
                                  >
                                    Delete
                                  </DropdownItem>
                                  <DropdownItem
                                      onClick={() => console.log("Edit user", user.id)}
                                      className="text-blue-500 hover:bg-blue-100 px-4 py-2 rounded-md"
                                  >
                                    Edit
                                  </DropdownItem>
                                </div>
                              </Dropdown>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex-shrink-0">
                <Select
                    options={config.itemsPerPageOptions.map((value) => ({
                      value: value.toString(),
                      label: `${value} items per page`
                    }))}
                    placeholder="Select items per page"
                    defaultValue={config.defaultItemsPerPage.toString()}
                    onChange={(value) => setItemsPerPage(Number(value))}
                    className="border border-gray-300 rounded px-2 py-1 w-auto"
                />
              </div>

              <div className="flex items-center justify-end w-full">
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

      export default UserTable;
