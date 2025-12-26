"use client";

import React, {useEffect, useState} from "react";
import Button from "@/components/ui/button/Button";
import {useError} from "@/context/ErrorContext";
import {activateDevice, fetchUsers} from "@/server/api/users";
import {useMessage} from "@/context/MessageContext";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import {getDataUserAuth, getIsOwner} from "@/server/api/auth";
import Select from "@/components/form/Select";
import {ChevronDownIcon} from "@/icons";
import { useT } from "@/i18n/I18nProvider";

const ActivateUserForm = () => {
    const t = useT("forms.activateForm");
    const tCommon = useT("common.buttons");
    const userData = getDataUserAuth();
    const isOwner = getIsOwner();
    const [users, setUsers] = useState<any[]>([]);
    const setError = useError().setError;
    const [form, setForm] = React.useState({
        user_id: isOwner ? userData.id : "",
        code: "",
    });
    const [loading, setLoading] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState({
        code: "",
        owner_id: ""
    });
    const setMessage = useMessage().setMessage;

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const clearForm = () => {
        setForm({...form, code: ''});
        console.log(form)
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({code: "", owner_id: ""});
        try {
            if (isOwner) {
                setForm({...form, user_id: userData.id});
            }
            const response = await activateDevice(form);
            setMessage(response.message);
        } catch (error: any) {
            if (error.data.errors) {
                Object.entries(error.data.errors).forEach(([field, messages]) => {
                    setValidationErrors(prev => ({...prev, [field]: messages}));
                });
            } else {
                setError(error.data?.message || error.message|| error.data?.error || t("errors.loadUsers"));
            }
        } finally {
            clearForm()
            setLoading(false);
        }
    };

    const handleOwnerChange = (value: any) => {
        if (!isOwner) setForm({ ...form, user_id: value });
    };

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const allUsers = await fetchUsers();
                const filtered = allUsers.filter((u: { role: string; enabled: any; }) => u.role !== "admin" && u.enabled);
                setUsers(filtered);
            } catch (error: any) {
                setError(error.data?.message || error.message|| error.data?.error || t("errors.loadUsers"));
            }
        };
        console.log(userData)
        console.log(isOwner)
        if (!isOwner) {
            fetchOwners();
        };
    }, [setError, userData, isOwner]);

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
            <div className="mb-5">
                <Label>{t("labels.code")}</Label>
                <Input
                    name="code"
                    value={form.code}
                    defaultValue={form.code}
                    onChange={handleChange}
                    error={validationErrors.code !== ""}
                    hint={validationErrors.code}
                />
            </div>
            {!isOwner && (
                <div className="mb-5">
                    <Label>{t("labels.owner")}</Label>
                    <div className="flex flex-shrink-0 w-full sm:w-auto">
                        <div className="relative">
                            <Select
                                onChange={handleOwnerChange}
                                options={ isOwner
                                    ? [{ value: userData.id, label: userData.name }]
                                    : users.map(u => ({ value: u.id, label: u.name }))}
                                disabled={isOwner}
                                className="w-full sm:w-auto"
                                error={validationErrors.owner_id !== ""}
                                hint={validationErrors.owner_id}
                            />
                            <span
                                className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <ChevronDownIcon/>
                        </span>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex gap-2 justify-end">
                <Button type="submit" variant="primary" loading={loading}>
                    {tCommon("activate")}
                </Button>
            </div>
        </form>
    );
};

export default ActivateUserForm;
