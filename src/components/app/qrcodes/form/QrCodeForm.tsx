"use client";

import React, { useEffect, useState } from "react";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import { useError } from "@/context/ErrorContext";
import { useRouter } from "next/navigation";
import { fetchBusinesses } from "@/server/api/business";
import { createQrCode, updateQrCode } from "@/server/api/qrcodes";
import Form from "@/components/form/Form";
import TextArea from "@/components/form/input/TextArea";
import config from "@/config/globalConfig";
import {ChevronDownIcon} from "@/icons";
import { QRCodeCanvas } from 'qrcode.react';
import PositionExample from "@/components/common/PositionExample";
import handleDownloadQr from "@/utils/qrCode";

interface QrCodeFormProps {
    qrcode?: any;
}
const QrCodeForm:React.FC<QrCodeFormProps> = ({ qrcode }) => {
    const [form, setForm] = useState({
        name: qrcode?.name || "",
        info: qrcode?.info || "",
        position: qrcode?.position || "bl",
        business_id: qrcode?.business_id || "",
    });
    const [business, setBusiness] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({
        name: "",
        business_id: "",
        info: "",
        position: ""
    });
    const setError = useError().setError;
    const router = useRouter();

    useEffect(() => {
        const getBusiness = async () => {
            try {
                const allBusiness = await fetchBusinesses();
                setBusiness(allBusiness);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error al cargar negocios");
            }
        };
        getBusiness();
    }, [setError]);

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (value: any) => {
        setForm({ ...form, business_id: value });
    };

    const handlePositionChange = (value: any) => {
        setForm({...form, position: value});
    };

    const handleTextAreaChange = (value: any) => {
        setForm({ ...form, info: value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({business_id: "", info: "", name: "", position: ""});
        try {
            if (qrcode) {
                await updateQrCode(qrcode.id, form);
            } else {
                await createQrCode(form);
            }
            router.push("/qrcodes");
        } catch (err: any) {
            if (err.data?.errors) {
                setValidationErrors(err.data.errors)
            } else {
                setError(err.data?.message || err.message || "Error al guardar QR");
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
                    error={validationErrors?.name !== ""}
                    hint={validationErrors?.name}
                />
            </div>
            <div className="mb-6">
                <Label>Negocio *</Label>
                <div className="relative">
                    <Select
                        defaultValue={form.business_id}
                        onChange={handleSelectChange}
                        options={business.map(b => ({ value: b.id, label: b.name }))}
                        className="w-full"
                        error={validationErrors?.business_id !== ""}
                        hint={validationErrors?.business_id}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon />
                    </span>
                </div>
            </div>
            <div className="mb-8">
                <Label>Información *</Label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-1">
                        <TextArea
                            value={form.info}
                            onChange={handleTextAreaChange}
                            rows={6}
                            error={validationErrors?.info !== ""}
                            hint={validationErrors?.info}
                        />
                    </div>
                    {form.info !== "" && (
                        <div className="flex flex-col items-center gap-2">
                            <QRCodeCanvas
                                id="qrcode-canvas"
                                value={form.info || []}
                                size={120}
                                level="H"
                                marginSize={1}
                            />
                            <Button type="button" variant="outline" onClick={handleDownloadQr} className="mt-2 w-full">
                                Descargar QR
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full">
                    <div className="flex-1 min-w-0">
                        <Label>Qr Position</Label>
                        <div className="relative mb-5">
                            <Select
                                defaultValue={form.position || "bl"}
                                onChange={handlePositionChange}
                                options={config.positions.map(u => ({value: u.value, label: u.label}))}
                                className="w-full"
                                error={validationErrors.position !== ""}
                                hint={validationErrors.position}
                            />
                            <span
                                className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                        <ChevronDownIcon/>
                                    </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center flex-shrink-0 mt-4 sm:mt-0">
                        <span className="font-medium mb-2">Example</span>
                        <PositionExample position={form.position}/>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push("/qrcodes")}>Cancelar</Button>
                <Button type="submit" variant="primary" loading={loading}>
                    {qrcode ? "Guardar cambios" : "Crear"}
                </Button>
            </div>
        </Form>
    );
};

export default QrCodeForm;
