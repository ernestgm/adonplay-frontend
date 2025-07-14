"use client";

import React, {useState} from "react";
import Button from "@/components/ui/button/Button";
import {useError} from "@/context/ErrorContext";
import {activateDevice} from "@/server/api/users";
import {useMessage} from "@/context/MessageContext";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

const ActivateUserForm = ({userId}) => {
    const setError = useError().setError;
    const [form, setForm] = React.useState({
        user_id: userId || "",
        code: "",
    });
    const [loading, setLoading] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState({});
    const setMessage = useMessage().setMessage;

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const clearForm = () => {
        setForm({...form, code: ''});
        console.log(form)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({});
        try {
            const response = await activateDevice(form);
            setMessage(response.message);
        } catch (error) {
            if (error.data.errors) {
                Object.entries(error.data.errors).forEach(([field, messages]) => {
                    setValidationErrors(prev => ({...prev, [field]: messages}));
                });
            } else {
                setError(error.data?.message || error.message || "Error al iniciar sesión");
            }
        } finally {
            clearForm()
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
            <div className="mb-5">
                <Label>Code *</Label>
                <Input
                    name="code"
                    value={form.code}
                    defaultValue={form.code}
                    onChange={handleChange}
                    error={validationErrors.code}
                    hint={validationErrors.code}
                />
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="submit" variant="primary" loading={loading}>
                    Activate
                </Button>
            </div>
        </form>
    );
};

export default ActivateUserForm;
