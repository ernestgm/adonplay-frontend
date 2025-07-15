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
import Cookies from "js-cookie";
import {getDataUserAuth} from "@/server/api/auth";
import Form from "@/components/form/Form";

const UserForm = ({user}) => {
    const userData = getDataUserAuth()
    const [showPassword, setShowPassword] = useState(false);
    const setError = useError().setError;
    const [form, setForm] = React.useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        password: "",
        password_confirmation: "",
        enabled: user?.enabled || 1,
        role: user?.roles[0].id || "",
        // Agrega más campos según tu modelo
    });
    const [loading, setLoading] = React.useState(false);
    const [validationErrors, setValidationErrors] = React.useState({});
    const router = useRouter();

    const isAuthenticatedUserEditing = user?.id === userData.id; // Verificar si el usuario autenticado está editando su propio perfil

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleRoleSelectChange = (value: string) => {
        if (!isAuthenticatedUserEditing) { // Restringir cambios de rol si el usuario está editando su propio perfil
            setForm({...form, role: value});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setValidationErrors({});
        try {
            if (user) {
                const updatedForm = { ...form };
                // Solo incluir la contraseña si los campos no están vacíos
                if (!updatedForm.password || !updatedForm.password_confirmation) {
                    delete updatedForm.password;
                    delete updatedForm.password_confirmation;
                }
                await updateUser(user.id, updatedForm);
            } else {
                await createUser(form);
            }
            router.push("/users");
        } catch (error) {
            console.log(error);
            if (error.data.errors) {
                setValidationErrors(error.data.errors)
            } else {
                setError(error.data?.message || error.message || "Error al iniciar sesión");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">{user ? "Editar usuario" : "Crear usuario"}</h2>

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
            <div className="mb-5">
                <Label>Email *</Label>
                <div className="relative">
                    <Input
                        name="email"
                        type="email"
                        defaultValue={form.email}
                        onChange={handleChange}
                        required
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
                <Label>Phone</Label>
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
                <Label>Password *</Label>
                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        defaultValue={form.password || ''}
                        onChange={handleChange}
                        required={!user} // Solo requerido al crear
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
                <Label>Confirm Password *</Label>
                <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    name="password_confirmation"
                    defaultValue={form.password_confirmation || ''}
                    onChange={handleChange}
                    required={!user} // Solo requerido al crear
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
                <Label>Role *</Label>
                <div className="flex flex-shrink-0 w-full sm:w-auto">
                    <div className="relative">
                        <Select
                            options={config.roleValues.map((item) => ({
                                value: item.value.toString(),
                                label: item.label
                            }))}
                            placeholder="Select role"
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
            {/* Agrega más campos aquí si es necesario */}
            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => router.push("/users")}>Cancelar</Button>
                <Button type="submit" variant="primary" loading={loading}>
                    {user ? "Guardar cambios" : "Crear"}
                </Button>
            </div>
        </Form>
    );
};

export default UserForm;
