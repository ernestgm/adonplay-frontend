"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { useError } from "@/context/ErrorContext";
import { createBusiness, updateBusiness } from "@/server/api/business";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";
import { fetchUsers } from "@/server/api/users";
import { getDataUserAuth } from "@/server/api/auth";
import Form from "@/components/form/Form";
import {ChevronDownIcon} from "@/icons";

interface BusinessFormProps {
    business?: any;
}

const BusinessForm: React.FC<BusinessFormProps> = ({ business }) => {
    const userData = getDataUserAuth();
    const [form, setForm] = useState({
        name: business?.name || "",
        description: business?.description || "",
        owner_id: business?.owner_id || "",
    });
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [users, setUsers] = useState([]);
    const setError = useError().setError;
    const router = useRouter();

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const allUsers = await fetchUsers();
                const filtered = allUsers.filter(u => u.role !== "admin");
                setUsers(filtered);
            } catch (err) {
                setError("Error al cargar usuarios para owner");
            }
        };
        fetchOwners();
    }, [setError]);

    const isOwner = userData.roles?.some(r => r.code === "owner");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleOwnerChange = (value) => {
        if (!isOwner) setForm({ ...form, owner_id: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({});
        try {
            if (business) {
                await updateBusiness(business.id, form);
            } else {
                await createBusiness(form);
            }
            router.push("/business");
        } catch (err) {
            if (err.data?.errors) {
                setValidationErrors(err.data.errors)
            } else {
                setError(err.data?.message || err.message || "Error al guardar negocio");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
            <div className="mb-5">
                <Label>Nombre *</Label>
                <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={validationErrors.name}
                    hint={validationErrors.name}
                />
            </div>
            <div className="mb-5">
                <Label>Descripción</Label>
                <Input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    error={validationErrors.description}
                    hint={validationErrors.description}
                />
            </div>
            <div className="mb-5">
                <Label>Owner *</Label>
                <div className="flex flex-shrink-0 w-full sm:w-auto">
                    <div className="relative">
                        <Select
                            defaultValue={ isOwner ? userData.id : form.owner_id}
                            onChange={handleOwnerChange}
                            options={ isOwner
                                ? [{ value: userData.id, label: userData.name }]
                                : users.map(u => ({ value: u.id, label: u.name }))}
                            disabled={isOwner}
                            className="w-full sm:w-auto"
                            error={validationErrors.owner_id}
                            hint={validationErrors.owner_id}
                        />
                        <span
                            className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <ChevronDownIcon/>
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push("/business")}>Cancelar</Button>
                <Button type="submit" variant="primary" loading={loading}>
                    {business ? "Guardar cambios" : "Crear"}
                </Button>
            </div>
        </Form>
    );
};

export default BusinessForm;
