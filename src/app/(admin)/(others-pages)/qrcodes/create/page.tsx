"use client"

import React from "react";
import MarqueesForm from "@/components/app/marquees/form/MarqueesForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import type {Metadata} from "next";
import QrCodeForm from "@/components/app/qrcodes/form/QrCodeForm";
import {useRouter} from "next/navigation";

export default function QrCreatePage () {
    const router = useRouter();
    const handleBack = () => {
        router.push(`/qrcodes`);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Crear Qr Code" onBack={handleBack}/>
            <QrCodeForm />
        </div>
    );
};
