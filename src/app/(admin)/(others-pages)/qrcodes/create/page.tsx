"use client"

import React, {Suspense} from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
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
