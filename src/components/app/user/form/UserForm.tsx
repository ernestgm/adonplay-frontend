"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {useError} from "@/context/ErrorContext";
import {createUser, updateUser} from "@/server/api/users";
import Select from "@/components/form/Select";
import config from "@/config/globalConfig";
import Label from "@/components/form/Label";
import {ChevronDownIcon, EnvelopeIcon, EyeCloseIcon, EyeIcon} from "@/icons";
import {MdPhone} from "react-icons/md";
import {getDataUserAuth} from "@/server/api/auth";
import Form from "@/components/form/Form";
import Checkbox from "@/components/form/input/Checkbox";
import {useT} from "@/i18n/I18nProvider";

interface UserFormProps {
    user?: any;
}
const UserForm: React.FC<UserFormProps> = ({user}) => {
    const t = useT("forms.users");
    const tCommon = useT("common.buttons");
    const tSelect = useT("common.select");
    const userData = getDataUserAuth()
    const [showPassword, setShowPassword] = useState(false);
    const setError = useError().setError;
    const [form, setForm] = React.useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        password: "",
        password_confirmation: "",
        enabled: user?.enabled || false,
        role: user?.role || "",
        // Agrega más campos según tu modelo
    });
    const [loading, setLoading] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState({
        name: undefined,
        email: undefined,
        phone: undefined,
        password: undefined,
        password_confirmation: undefined,
        role: undefined
    });
    const router = useRouter();

    const isAuthenticatedUserEditing = user?.id === userData.id; // Verificar si el usuario autenticado está editando su propio perfil

    const handleChange = (e: any) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleRoleSelectChange = (value: string) => {
        if (!isAuthenticatedUserEditing) { // Restringir cambios de rol si el usuario está editando su propio perfil
            setForm({...form, role: value});
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({
            email: undefined,
            name: undefined,
            password: undefined,
            password_confirmation: undefined,
            phone: undefined,
            role: undefined
        });
        try {
            if (user) {
                const updatedForm = { ...form };
                // Solo incluir la contraseña si los campos no están vacíos
                if (!updatedForm.password || !updatedForm.password_confirmation) {
                    // @ts-expect-error
                    delete updatedForm.password;
                    // @ts-expect-error
                    delete updatedForm.password_confirmation;
                }
                await updateUser(user.id, updatedForm);
            } else {
                await createUser(form);
            }
            router.push("/users");
        } catch (error: any) {
            console.log(error);
            if (error.data.errors) {
                setValidationErrors(error.data.errors)
            } else {
                setError(error.data?.message || error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
            <div className="mb-5">
                <Label>{t("name")} *</Label>
                <Input
                    name="name"
                    defaultValue={form.name}
                    onChange={handleChange}
                    error={validationErrors.name}
                    hint={validationErrors.name}
                />
            </div>
            <div className="mb-5">
                <Label>{t("email")} *</Label>
                <div className="relative">
                    <Input
                        name="email"
                        type="email"
                        defaultValue={form.email}
                        onChange={handleChange}
                        error={validationErrors.email}
                        hint={validationErrors.email}
                        className="pl-[62px]"
                    />
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        <EnvelopeIcon />
                    </span>
                </div>
            </div>
            <div className="mb-5">
                <Label>{t("phone")}</Label>
                <div className="relative">
                    <Input
                        name="phone"
                        type="text"
                        defaultValue={form.phone}
                        onChange={handleChange}
                        error={validationErrors.phone}
                        hint={validationErrors.phone}
                        className="pl-[62px]"
                    />
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        <MdPhone />
                    </span>
                </div>
            </div>
            <div className="mb-5">
                <Label>{t("password")} *</Label>
                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        defaultValue={form.password || ''}
                        onChange={handleChange}
                        error={validationErrors.password}
                        hint={validationErrors.password}
                    />
                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                </div>
            </div>
            <div className="mb-5">
                <Label>{t("confirmPassword")} *</Label>
                <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    name="password_confirmation"
                    defaultValue={form.password_confirmation || ''}
                    onChange={handleChange}
                    error={validationErrors.password_confirmation}
                    hint={validationErrors.password_confirmation}
                />
                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                          {showPassword ? (
                              <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                          ) : (
                              <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                          )}
                        </span>
                </div>
            </div>
            <div className="mb-5">
                <Label>{t("role")} *</Label>
                <div className="flex flex-shrink-0 w-full sm:w-auto">
                    <div className="relative">
                        <Select
                            options={config.roleValues.map((item) => ({
                                value: item.value.toString(),
                                label: item.label
                            }))}
                            placeholder={tSelect("placeholder")}
                            defaultValue={form.role || ''}
                            onChange={handleRoleSelectChange}
                            className="w-full sm:w-auto"
                            error={validationErrors.role}
                            hint={validationErrors.role}
                            disabled={isAuthenticatedUserEditing} // Deshabilitar campo de rol si está editando su propio perfil
                        />
                        <span
                            className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <ChevronDownIcon/>
                        </span>
                    </div>

                </div>
            </div>
            <div className="mb-5">
                <Checkbox
                    checked={form.enabled}
                    onChange={() => { setForm({ ...form, enabled: !form.enabled }) }}
                    label={t("enabled")}
                />
            </div>
            {/* Agrega más campos aquí si es necesario */}
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push("/users")}>{tCommon("cancel")}</Button>
                <Button type="submit" variant="primary" loading={loading}>
                    {user ? tCommon("saveChanges") : tCommon("create")}
                </Button>
            </div>
        </Form>
    );
};

export default UserForm;
