"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { useError } from "@/context/ErrorContext";
import {createBusiness, fetchBusinesses, updateBusiness} from "@/server/api/business";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";
import { fetchUsers } from "@/server/api/users";
import { getDataUserAuth } from "@/server/api/auth";
import Form from "@/components/form/Form";
import {ChevronDownIcon} from "@/icons";
import {createSlide, updateSlide} from "@/server/api/slides";

const SlidesForm = ({ slides }) => {
    const userData = getDataUserAuth();
    const [form, setForm] = useState({
        name: slides?.name || "",
        description: slides?.description || "",
        business_id: slides?.business_id || "",
        description_position: slides?.description_position || "",
        description_size: slides?.description_size || "",
    });

    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [business, setBusiness] = useState([]);
    const setError = useError().setError;
    const router = useRouter();

    useEffect(() => {
        const getBusiness = async () => {
            try {
                const allBusiness = await fetchBusinesses();
                setBusiness(allBusiness);
            } catch (err) {
                setError("Error al cargar usuarios para owner");
            }
        };
        getBusiness();
    }, [setError]);

    const isOwner = userData.roles?.some(r => r.code === "owner");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleBusinessChange = (value) => {
        if (!isOwner) setForm({ ...form, business_id: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({});
        try {
            if (slides) {
                await updateSlide(slides.id, form);
            } else {
                await createSlide(form);
            }
            router.push("/slides");
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
                <Label>Business *</Label>
                <div className="flex flex-shrink-0 w-full sm:w-auto">
                    <div className="relative">
                        <Select
                            defaultValue={form.business_id}
                            onChange={handleBusinessChange}
                            options={ business.map(u => ({ value: u.id, label: u.name }))}
                            className="w-full sm:w-auto"
                            error={validationErrors.business_id}
                            hint={validationErrors.business_id}
                        />
                        <span
                            className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <ChevronDownIcon/>
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push("/slides")}>Cancelar</Button>
                <Button type="submit" variant="primary" loading={loading}>
                    {slides ? "Guardar cambios" : "Crear"}
                </Button>
            </div>
        </Form>
    );
};

export default SlidesForm;
