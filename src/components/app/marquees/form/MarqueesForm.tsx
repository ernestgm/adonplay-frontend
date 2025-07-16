"use client";

import React, { useEffect, useState } from "react";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import {getDataUserAuth} from "@/server/api/auth";
import {useError} from "@/context/ErrorContext";
import {useRouter} from "next/navigation";
import {createBusiness, fetchBusinesses, updateBusiness} from "@/server/api/business";
import Form from "@/components/form/Form";
import {createMarquees, updateMarquees} from "@/server/api/marquees";
import TextArea from "@/components/form/input/TextArea";

const MarqueesForm = ({ marquee }) => {
    const userData = getDataUserAuth();
    const isOwner = userData.roles?.some(r => r.code === "owner");
    const [form, setForm] = useState({
        name: marquee?.name || "",
        message: marquee?.message || "",
        business_id: marquee?.business_id || "",
        background_color: marquee?.background_color || "#000000",
        text_color: marquee?.text_color || "#ffffff",
    });
    const [business, setBusiness] = useState([]);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (value) => {
        setForm({ ...form, business_id: value });
    };

    const handleTextAreaChange = (value) => {
        setForm({ ...form, message: value });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({});
        try {
            if (marquee) {
                await updateMarquees(marquee.id, form);
            } else {
                await createMarquees(form);
            }
            router.push("/marquees");
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
            <div className="mb-6">
                <Label>Nombre *</Label>
                <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={validationErrors?.name}
                    hint={validationErrors?.name}
                />
            </div>
            <div className="mb-6">
                <Label>Negocio *</Label>
                <Select
                    defaultValue={form.business_id}
                    onChange={handleSelectChange}
                    options={business.map(b => ({ value: b.id, label: b.name }))}
                    className="w-full"
                    error={validationErrors?.business_id}
                    hint={validationErrors?.business_id}
                />
            </div>
            <div className="mb-8">
                <Label>Message *</Label>
                <TextArea
                    value={form.message}
                    onChange={handleTextAreaChange}
                    rows={6}
                    error={validationErrors?.message}
                    hint={validationErrors?.message}
                />
            </div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full">
                <div className="flex-1 min-w-0">
                    <Label>Color de fondo *</Label>
                    <Input
                        type="color"
                        name="background_color"
                        value={form.background_color}
                        onChange={handleChange}
                        error={validationErrors?.background_color}
                        hint={validationErrors?.background_color}
                        className="w-full"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <Label>Color de texto *</Label>
                    <Input
                        type="color"
                        name="text_color"
                        value={form.text_color}
                        onChange={handleChange}
                        error={validationErrors?.text_color}
                        hint={validationErrors?.text_color}
                        className="w-full"
                    />
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push("/marquees")}>Cancelar</Button>
                <Button type="submit" variant="primary" loading={loading}>
                    {marquee ? "Guardar cambios" : "Crear"}
                </Button>
            </div>
        </Form>
    );
};

export default MarqueesForm;
