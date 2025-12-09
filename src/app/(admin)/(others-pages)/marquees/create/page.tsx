"use client"
import React, {Suspense} from "react";
import MarqueesForm from "@/components/app/marquees/form/MarqueesForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {useRouter} from "next/navigation";

export default function MarqueeCreatePage () {
    const router = useRouter();
    const handleBack = () => {
        router.push(`/marquees`);
    };
    return (
        <div>
            <PageBreadcrumb pageTitle="Crear Marquee" onBack={handleBack}/>
            <MarqueesForm />
        </div>
    );
};
