"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Alert from "@/components/ui/alert/Alert";

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = Cookies.get("auth_token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
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

  return (
    <div>
      {/*{error && <Alert type="error" message={error} />}*/}
      <Button
        onClick={deleteSelectedUsers}
        disabled={selectedUsers.length === 0}
        variant="primary"
        className="mb-4"
      >
        Delete Selected
      </Button>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table className="min-w-full divide-y divide-gray-200">
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
              <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
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
                <TableCell className="px-6 py-4 whitespace-nowrap relative">
                  <div className="inline-block">
                    <Button
                      onClick={() => toggleDropdown(user.id)}
                      variant="outline"
                      size="sm"
                    >
                      Menu
                    </Button>
                    {openDropdowns[user.id] && (
                      <Dropdown isOpen={true} onClose={() => closeDropdown(user.id)} className="left-0">
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
      )}
    </div>
  );
};

export default UserTable;
