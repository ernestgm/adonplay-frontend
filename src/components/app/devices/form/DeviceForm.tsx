"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {useError} from "@/context/ErrorContext";
import Label from "@/components/form/Label";
import {getDataUserAuth} from "@/server/api/auth";
import Form from "@/components/form/Form";

interface UserFormProps {
    device?: any;
}
const DeviceForm: React.FC<UserFormProps> = ({device}) => {
    const userData = getDataUserAuth()
    const [showPassword, setShowPassword] = useState(false);
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

    function handleSubmit() {

    }

    return (
        <Form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
            <div className="mb-5">
                <Label>Name *</Label>
                <Input
                    name="name"
                    defaultValue={form.name}
                    onChange={handleChange}
                    required
                    error={validationErrors.name}
                    hint={validationErrors.name}
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
