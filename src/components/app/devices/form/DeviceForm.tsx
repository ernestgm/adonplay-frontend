"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {useError} from "@/context/ErrorContext";
import Label from "@/components/form/Label";
import {getDataUserAuth} from "@/server/api/auth";
import Form from "@/components/form/Form";
import {updateDevices} from "@/server/api/devices";

interface UserFormProps {
    device?: any;
}
const DeviceForm: React.FC<UserFormProps> = ({device}) => {
    const userData = getDataUserAuth()
    const setError = useError().setError;
    const [form, setForm] = React.useState({
        name: device?.name || "",
        qr_id: device?.qr_id || "",
        marquee_id: device?.marquee_id || "",
        slide_id: device?.slide_id || "",
        users_id: device?.users_id || "",
    });
    const [loading, setLoading] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState({});
    const router = useRouter();

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({});
        try {
            await updateDevices(device.id, form);
            router.push("/devices");
        } catch (err) {
            if (err.data?.errors) {
                setValidationErrors(err.data.errors)
            } else {
                setError(err.data?.message || err.message || "Error al guardar Device");
            }

        } finally {
            setLoading(false);
        }
    }

    return (
        <Form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
            <div className="mb-5">
                <Label>Name *</Label>
                <Input
                    name="name"
                    defaultValue={form.name}
                    onChange={handleChange}
                    error={validationErrors.name}
                    hint={validationErrors.name}
                />
            </div>
            <div className="mb-5">
                <Label>Qr *</Label>
                <Input
                    name="qr_id"
                    defaultValue={form.qr_id}
                    onChange={handleChange}
                    error={validationErrors.qr_id}
                    hint={validationErrors.qr_id}
                />
            </div>
            <div className="mb-5">
                <Label>Marquee *</Label>
                <Input
                    name="marquee_id"
                    defaultValue={form.marquee_id}
                    onChange={handleChange}
                    error={validationErrors.marquee_id}
                    hint={validationErrors.marquee_id}
                />
            </div>
            <div className="mb-5">
                <Label>Slide *</Label>
                <Input
                    name="slide_id"
                    defaultValue={form.slide_id}
                    onChange={handleChange}
                    error={validationErrors.slide_id}
                    hint={validationErrors.slide_id}
                />
            </div>
            <div className="mb-5">
                <Label>User *</Label>
                <Input
                    name="users_id"
                    defaultValue={form.users_id}
                    onChange={handleChange}
                    error={validationErrors.users_id}
                    hint={validationErrors.users_id}
                />
            </div>
            {/* Agrega más campos aquí si es necesario */}
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push("/devices")}>Cancelar</Button>
                <Button type="submit" variant="primary" loading={loading}>
                    { device ? "Guardar cambios" : "Crear"}
                </Button>
            </div>
        </Form>
    );
};

export default DeviceForm;
