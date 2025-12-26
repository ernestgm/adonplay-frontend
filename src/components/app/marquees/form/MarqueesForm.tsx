"use client";

import React, { useEffect, useState } from "react";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import {useError} from "@/context/ErrorContext";
import {useRouter} from "next/navigation";
import {fetchBusinesses} from "@/server/api/business";
import Form from "@/components/form/Form";
import {createMarquees, updateMarquees} from "@/server/api/marquees";
import TextArea from "@/components/form/input/TextArea";
import { useT } from "@/i18n/I18nProvider";

interface MarqueeFormProps {
    marquee?: any;
}
const MarqueesForm:React.FC<MarqueeFormProps> = ({ marquee }) => {
    const t = useT("forms.marquees");
    const tCommon = useT("common.buttons");
    const [form, setForm] = useState({
        name: marquee?.name || "",
        message: marquee?.message || "",
        business_id: marquee?.business_id || "",
        background_color: marquee?.background_color || "#000000",
        text_color: marquee?.text_color || "#ffffff",
    });
    const [business, setBusiness] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({
        name: "",
        business_id: "",
        message: "",
        background_color: "",
        text_color: ""
    });
    const setError = useError().setError;
    const router = useRouter();

    useEffect(() => {
        const getBusiness = async () => {
            try {
                const allBusiness = await fetchBusinesses();
                setBusiness(allBusiness);
            } catch (err: any) {
                setError(err.data?.message || err.message || t("errors.loadBusinesses"));
            }
        };
        getBusiness();
    }, [setError]);

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (value: any) => {
        setForm({ ...form, business_id: value });
    };

    const handleTextAreaChange = (value: any) => {
        setForm({ ...form, message: value });
    };


    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors(
            {
                text_color: "",
                background_color: "",
                message: "",
                business_id: "",
                name: ""
            }
            );
        try {
            if (marquee) {
                await updateMarquees(marquee.id, form);
            } else {
                await createMarquees(form);
            }
            router.push("/marquees");
        } catch (err: any) {
            if (err.data?.errors) {
                setValidationErrors(err.data.errors)
            } else {
                setError(err.data?.message || err.message || t("errors.saveItem"));
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
            <div className="mb-6">
                <Label>{t("labels.name")}</Label>
                <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={validationErrors?.name !== ""}
                    hint={validationErrors?.name}
                />
            </div>
            <div className="mb-6">
                <Label>{t("labels.business")}</Label>
                <Select
                    defaultValue={form.business_id}
                    onChange={handleSelectChange}
                    options={business.map(b => ({ value: b.id, label: b.name }))}
                    className="w-full"
                    error={validationErrors?.business_id !== ""}
                    hint={validationErrors?.business_id}
                />
            </div>
            <div className="mb-8">
                <Label>{t("labels.message")}</Label>
                <TextArea
                    value={form.message}
                    onChange={handleTextAreaChange}
                    rows={6}
                    error={validationErrors?.message !== ""}
                    hint={validationErrors?.message}
                />
            </div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full">
                <div className="flex-1 min-w-0">
                    <Label>{t("labels.backgroundColor")}</Label>
                    <Input
                        type="color"
                        name="background_color"
                        value={form.background_color}
                        onChange={handleChange}
                        error={validationErrors?.background_color !== ""}
                        hint={validationErrors?.background_color}
                        className="w-full"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <Label>{t("labels.textColor")}</Label>
                    <Input
                        type="color"
                        name="text_color"
                        value={form.text_color}
                        onChange={handleChange}
                        error={validationErrors?.text_color !== "" }
                        hint={validationErrors?.text_color}
                        className="w-full"
                    />
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push("/marquees")}>
                    {tCommon("cancel")}
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                    {marquee ? tCommon("saveChanges") : tCommon("create")}
                </Button>
            </div>
        </Form>
    );
};

export default MarqueesForm;
