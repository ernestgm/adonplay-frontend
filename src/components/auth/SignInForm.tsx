"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import {EyeCloseIcon, EyeIcon} from "@/icons";
import React, {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import Cookies from "js-cookie";
import {signIn} from "@/server/api/auth";
import {useT} from "@/i18n/I18nProvider";

export default function SignInForm() {
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useT("forms.signIn");
    const tPage = useT("page.signIn");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setValidationErrors({});
        setLoading(true);

        try {
            const data = await signIn(email, password);
            Cookies.set("auth_token", data.token, {path: "/"});
            Cookies.set("user", JSON.stringify(data.user), {path: "/"});
            const redirect = searchParams.get("redirect");
            router.push(redirect || "/");
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'data' in err) {
                const data = (err as { data?: unknown }).data as any;
                if (data?.errors && typeof data.errors === 'object') {
                    Object.entries(data.errors as Record<string, string[]>).forEach(([field, messages]) => {
                        setValidationErrors(prev => ({...prev, [field]: messages}));
                    });
                } else {
                    const message = (data?.message as string) || (err as any).message || t("errors.invalidCredentials");
                    setError(message);
                }
            } else {
                setError(t("errors.invalidCredentials"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            {tPage("pageTitle")}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("tips.heading1")}
                        </p>
                    </div>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <Label>
                                        {t("labels.email")} <span className="text-error-500">*</span>{" "}
                                    </Label>
                                    <Input
                                        placeholder="info@gmail.com"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                    {validationErrors.email && (
                                        <div className="text-error-500 text-sm">
                                            {validationErrors.email.join(", ")}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label>
                                        {t("labels.password")} <span className="text-error-500">*</span>{" "}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder={t("placeholders.password")}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                        <span
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                        >
                      {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400"/>
                      ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400"/>
                      )}
                    </span>
                                    </div>
                                    {validationErrors.password && (
                                        <div className="text-error-500 text-sm">
                                            {validationErrors.password.join(", ")}
                                        </div>
                                    )}
                                </div>
                                {error && <div className="text-error-500 text-sm">{error}</div>}
                                <div>
                                    <Button className="w-full" size="sm" type="submit" loading={loading}>
                                        {t("labels.signIn")}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
