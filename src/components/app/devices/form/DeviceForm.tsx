"use client";

import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {useError} from "@/context/ErrorContext";
import Label from "@/components/form/Label";
import {getDataUserAuth, getIsOwner} from "@/server/api/auth";
import Form from "@/components/form/Form";
import {updateDevices} from "@/server/api/devices";
import RadioImage from "@/components/form/input/RadioImage";
import {MdOutlineStayCurrentLandscape, MdOutlineStayCurrentPortrait} from "react-icons/md";
import CheckboxImage from "@/components/form/input/CheckboxImage";
import {RiSlideshowLine} from "react-icons/ri";
import ComponentCard from "@/components/common/ComponentCard";
import {fetchUsers} from "@/server/api/users";
import Select from "@/components/form/Select";
import {ChevronDownIcon} from "@/icons";
import {fetchSlidesByUser} from "@/server/api/slides";
import {fetchQrCodeByUser} from "@/server/api/qrcodes";
import {fetchMarqueesByUser} from "@/server/api/marquees";
import {fetchYoutubeSourcesByUser} from "@/server/api/youtubeSources";
import Checkbox from "@/components/form/input/Checkbox";
import { useT } from "@/i18n/I18nProvider";

interface UserFormProps {
    device?: any;
}

const DeviceForm: React.FC<UserFormProps> = ({device}) => {
    const t = useT("forms.devices");
    const tCommon = useT("common.buttons");
    const tSelect = useT("common.select");
    const userData = getDataUserAuth()
    const isOwner = getIsOwner()
    const [users, setUsers] = useState<any[]>([]);
    const [slides, setSlides] = useState<any[]>([]);
    const [marquees, setMarquees] = useState<any[]>([]);
    const [youtubeSources, setYoutubeSources] = useState<any[]>([]);
    const [qrs, setQrs] = useState<any[]>([]);
    const setError = useError().setError;
    const [form, setForm] = React.useState({
        name: device?.name || "",
        qr_id: device?.qr_id || "",
        marquee_id: device?.marquee_id || "",
        slide_id: device?.slide_id || "",
        users_id: device?.users_id || "",
        portrait: device?.portrait || false,
        as_presentation: device?.as_presentation || false,
        youtube_source_id: device?.youtube_source_id || "",
        youtube_enabled: device?.youtube_enabled ?? false,
    });
    const [loading, setLoading] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState({
        name: "",
        users_id: "",
        qr_id: "",
        marquee_id: ""
    });
    const router = useRouter();

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handlePortraitChange = (value: string) => {
        setForm({...form, portrait: value == "1"});
    };

    const handleAsPresentationChange = (value: any) => {
        setForm({...form, as_presentation: value});
    };

    const handleUserChange = (value: any) => {
        if (!isOwner) setForm({...form, users_id: value});
    };

    const handleSlidesChange = (value: any) => {
        setForm({...form, slide_id: value});
    };

    const handleQrChange = (value: any) => {
        setForm({...form, qr_id: value});
    };

    const handleMarqueeChange = (value: any) => {
        setForm({...form, marquee_id: value});
    };

    const handleYoutubeSourceChange = (value: any) => {
        setForm({...form, youtube_source_id: value, youtube_enabled: Boolean(value)});
    };

    const userSelectUpdateForm = () => {
        if (form.users_id != device?.users_id) {
            setForm({...form, slide_id: "", qr_id: "", marquee_id: "", youtube_source_id: "", youtube_enabled: false});
        } else {
            setForm({...form, slide_id: device?.slide_id, qr_id: device?.qr_id, marquee_id: device?.marquee_id, youtube_source_id: device?.youtube_source_id, youtube_enabled: device?.youtube_enabled});
        }
    }
    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({marquee_id: "", qr_id: "", users_id: "", name: ""});
        try {
            await updateDevices(device.id, form);
            router.push("/devices");
        } catch (err: any) {
            if (err.data?.errors) {
                setValidationErrors(err.data.errors)
            } else {
                setError(err.data?.message || err.message || t("errors.saveItem"));
            }

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const slides = await fetchSlidesByUser(form.users_id);
                setSlides(slides);
            } catch (err: any) {
                setError(err.data?.message || err.message || t("errors.loadSlides"));
            }
        };
        const fetchQrs = async () => {
            try {
                const qrs = await fetchQrCodeByUser(form.users_id);
                setQrs(qrs);
            } catch (err: any) {
                setError(err.data?.message || err.message || t("errors.loadQrs"));
            }
        };
        const fetchMarquees = async () => {
            try {
                const marquees = await fetchMarqueesByUser(form.users_id);
                setMarquees(marquees);
            } catch (err: any) {
                setError(err.data?.message || err.message || t("errors.loadMarquees"));
            }
        };
        const fetchYoutube = async () => {
            try {
                setYoutubeSources(await fetchYoutubeSourcesByUser(form.users_id));
            } catch (err: any) {
                setError(err.data?.message || err.message || t("errors.loadYoutubeSources"));
            }
        };

        fetchSlides();
        fetchQrs();
        fetchMarquees();
        fetchYoutube();
        userSelectUpdateForm()
    }, [form.users_id]);

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const allUsers = await fetchUsers();
                const filtered = allUsers.filter((u: { role: string; enabled: any; }) => u.role !== "admin" && u.enabled);
                setUsers(filtered);
            } catch (err: any) {
                setError(err.data?.message || err.message || t("errors.loadUsers"));
            }
        };
        if (!isOwner) {
            fetchOwners();
        }

    }, []);

    // Un owner sólo puede administrar sus propios dispositivos: precargamos su id
    // para que el formulario quede seleccionado por defecto y se envíe correcto.
    useEffect(() => {
        if (isOwner && userData?.id && !form.users_id) {
            setForm((prev) => ({ ...prev, users_id: userData.id }));
        }
    }, [isOwner, userData?.id, form.users_id]);

    return (
        <Form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-surface border border-line rounded-2xl shadow-theme-xs">
            <div className="mb-5 flex flex-row items-center gap-1">
                <Label>{t("labels.deviceId")} </Label>
                <Label>{ device?.device_id }</Label>
            </div>
            <div className="mb-5">
                <Label>{t("labels.name")}</Label>
                <Input
                    name="name"
                    defaultValue={form.name}
                    onChange={handleChange}
                    error={validationErrors.name !== ""}
                    hint={validationErrors.name}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="mb-5">
                    <Label>{t("labels.user")}</Label>
                    <div className="flex flex-shrink-0 w-full sm:w-auto">
                        <div className="relative">
                            <Select
                                defaultValue={isOwner ? userData.id : form.users_id}
                                onChange={handleUserChange}
                                placeholder={tSelect("placeholder")}
                                options={isOwner
                                    ? [{value: userData.id, label: userData.name}]
                                    : users.map(u => ({value: u.id, label: u.name}))}
                                disabled={isOwner}
                                className="w-full sm:w-auto"
                                error={validationErrors.users_id !== ""}
                                hint={validationErrors.users_id}
                            />
                            <span
                                className="absolute text-content-muted -translate-y-1/2 pointer-events-none right-3 top-1/2">
                          <ChevronDownIcon/>
                        </span>
                        </div>
                    </div>
                </div>
                <div className="mb-5">
                    <Label>{t("labels.slides")}</Label>
                    <div className="flex flex-shrink-0 w-full sm:w-auto">
                        <div className="relative">
                            <Select
                                defaultValue={form.slide_id}
                                onChange={handleSlidesChange}
                                options={slides.map(u => ({value: u.id, label: u.name}))}
                                className="w-full sm:w-auto"
                                placeholder={t("placeholders.noSlide")}
                                disabledPlaceholder={false}
                                error={validationErrors.users_id !== ""}
                                hint={validationErrors.users_id}
                            />
                            <span
                                className="absolute text-content-muted -translate-y-1/2 pointer-events-none right-3 top-1/2">
                          <ChevronDownIcon/>
                        </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="mb-5">
                    <Label>{t("labels.qr")}</Label>
                    <div className="flex flex-shrink-0 w-full sm:w-auto">
                        <div className="relative">
                            <Select
                                defaultValue={form.qr_id}
                                onChange={handleQrChange}
                                options={qrs.map(u => ({value: u.id, label: u.name}))}
                                className="w-full sm:w-auto"
                                placeholder={t("placeholders.noQr")}
                                disabledPlaceholder={false}
                                error={validationErrors.qr_id !== ""}
                                hint={validationErrors.qr_id}
                            />
                            <span
                                className="absolute text-content-muted -translate-y-1/2 pointer-events-none right-3 top-1/2">
                          <ChevronDownIcon/>
                        </span>
                        </div>
                    </div>
                </div>
                <div className="mb-5">
                    <Label>{t("labels.marquee")}</Label>
                    <div className="flex flex-shrink-0 w-full sm:w-auto">
                        <div className="relative">
                            <Select
                                defaultValue={form.marquee_id}
                                onChange={handleMarqueeChange}
                                options={marquees.map(u => ({value: u.id, label: u.name}))}
                                placeholder={t("placeholders.noMarquee")}
                                disabledPlaceholder={false}
                                className="w-full sm:w-auto"
                                error={validationErrors.marquee_id !== ""}
                                hint={validationErrors.marquee_id}
                            />
                            <span
                                className="absolute text-content-muted -translate-y-1/2 pointer-events-none right-3 top-1/2">
                          <ChevronDownIcon/>
                        </span>
                        </div>
                    </div>
                </div>
            </div>
            <ComponentCard title={t("sections.settings")} className="mb-6">
                <div className="gap-3 flex flex-row justify-between">
                    <div className="mb-5">
                        <CheckboxImage
                            checked={form.as_presentation}
                            onChange={handleAsPresentationChange}
                            label={t("labels.presentationMode")}
                            image={<RiSlideshowLine size={30}/>}
                        />
                    </div>
                    <div className="flex flex-row gap-2 mb-5">
                        <RadioImage
                            id="landscape"
                            name="portrait"
                            value="0"
                            checked={!form.portrait}
                            label={t("labels.landscapeMode")}
                            onChange={handlePortraitChange}
                            image={<MdOutlineStayCurrentLandscape size={20}/>}
                        />

                        <RadioImage
                            id="portrait"
                            name="portrait"
                            value="1"
                            checked={form.portrait}
                            label={t("labels.portraitMode")}
                            onChange={handlePortraitChange}
                            image={<MdOutlineStayCurrentPortrait size={20}/>}
                        />
                    </div>
                </div>
            </ComponentCard>

            <ComponentCard title={t("sections.youtube")} className="mb-6">
                <div className="mb-5">
                    <Label>{t("labels.youtubeSource")}</Label>
                    <div className="relative">
                        <Select
                            defaultValue={form.youtube_source_id}
                            onChange={handleYoutubeSourceChange}
                            options={youtubeSources.map((source) => ({value: String(source.id), label: source.name}))}
                            placeholder={t("placeholders.noYoutubeSource")}
                            disabledPlaceholder={false}
                            className="w-full"
                        />
                        <span className="absolute text-content-muted -translate-y-1/2 pointer-events-none right-3 top-1/2"><ChevronDownIcon /></span>
                    </div>
                </div>
                <div className="mb-5">
                    <Checkbox checked={form.youtube_enabled} onChange={(checked) => setForm({...form, youtube_enabled: checked})} label={t("labels.youtubeEnabled")} />
                </div>
            </ComponentCard>

            {/* Agrega más campos aquí si es necesario */}
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push("/devices")}>{tCommon("cancel")}</Button>
                <Button type="submit" variant="primary" loading={loading}>
                    {device ? tCommon("saveChanges") : tCommon("add")}
                </Button>
            </div>
        </Form>
    );
};

export default DeviceForm;
