"use client";

import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {useError} from "@/context/ErrorContext";
import {fetchBusinesses} from "@/server/api/business";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";
import Form from "@/components/form/Form";
import {ChevronDownIcon} from "@/icons";
import {createSlide, updateSlide} from "@/server/api/slides";
import ComponentCard from "@/components/common/ComponentCard";
import config from "@/config/globalConfig";
import PositionExample from "@/components/common/PositionExample";
import { useT } from "@/i18n/I18nProvider";

interface SlidesFormProps {
    slides?: any;
}
const SlidesForm:React.FC<SlidesFormProps> = ({slides}) => {
    const t = useT("forms.slides");
    const tCommon = useT("common.buttons");
    const [form, setForm] = useState({
        name: slides?.name || "",
        description: slides?.description || "",
        business_id: slides?.business_id || "",
        description_position: slides?.description_position || "bc",
        description_size: slides?.description_size || "md",
    });

    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({
        name: "",
        description: "",
        description_position: "",
        description_size: "",
        business_id: ""
    });
    const [business, setBusiness] = useState<any[]>([]);
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

    const handleChange = (e: any) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleBusinessChange = (value: any) => {
        setForm({...form, business_id: value});
    };

    const handlePositionChange = (value: any) => {
        setForm({...form, description_position: value});
    };

    const handleTextSizeChange = (value: any) => {
        setForm({...form, description_size: value});
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({business_id: "", description: "", description_position: "", description_size: "", name: ""});
        try {
            if (slides) {
                await updateSlide(slides.id, form);
            } else {
                await createSlide(form);
            }
            router.push("/slides");
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
            <div className="mb-5">
                <Label>{t("labels.name")}</Label>
                <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={validationErrors.name !== ""}
                    hint={validationErrors.name}
                />
            </div>
            <div className="mb-5">
                <Label>{t("labels.description")}</Label>
                <Input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    error={validationErrors.description !== ""}
                    hint={validationErrors.description}
                />
            </div>
            <div className="mb-5">
                <Label>{t("labels.business")}</Label>
                <div className="flex flex-shrink-0 w-full sm:w-auto">
                    <div className="relative">
                        <Select
                            defaultValue={form.business_id}
                            onChange={handleBusinessChange}
                            options={business.map(u => ({value: u.id, label: u.name}))}
                            className="w-full sm:w-auto"
                            error={validationErrors.business_id !== ""}
                            hint={validationErrors.business_id}
                        />
                        <span
                            className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <ChevronDownIcon/>
                        </span>
                    </div>
                </div>
            </div>
            <div className="mb-5">
                <ComponentCard title={t("sections.imagesDescriptionSettings")}>
                    <div className="flex flex-wrap items-center gap-8">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full">
                            <div className="flex-1 min-w-0">
                                <Label>{t("labels.descriptionPosition")}</Label>
                                <div className="relative mb-5">
                                    <Select
                                        defaultValue={form.description_position}
                                        onChange={handlePositionChange}
                                        options={config.positions.map(u => ({value: u.value, label: u.label}))}
                                        className="w-full"
                                        error={validationErrors.description_position !== ""}
                                        hint={validationErrors.description_position}
                                    />
                                    <span
                                        className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                        <ChevronDownIcon/>
                                    </span>
                                </div>
                                <Label>{t("labels.textSize")}</Label>
                                <div className="relative">
                                    <Select
                                        defaultValue={form.description_size}
                                        onChange={handleTextSizeChange}
                                        options={config.text_sizes.map(u => ({value: u.value, label: u.label}))}
                                        className="w-full"
                                        error={validationErrors.description_size !== ""}
                                        hint={validationErrors.description_size}
                                    />
                                    <span
                                        className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                        <ChevronDownIcon/>
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center flex-shrink-0 mt-4 sm:mt-0">
                                <span className="font-medium mb-2">{t("labels.example")}</span>
                                <PositionExample position={form.description_position}/>
                            </div>
                        </div>
                    </div>
                </ComponentCard>
            </div>
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push("/slides")}>{tCommon("cancel")}</Button>
                <Button type="submit" variant="primary" loading={loading}>
                    {slides ? tCommon("saveChanges") : tCommon("create")}
                </Button>
            </div>
        </Form>
    );
};

export default SlidesForm;
