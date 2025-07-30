"use client"

import BusinessForm from '@/components/app/business/form/BusinessForm';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React from 'react';
import type {Metadata} from "next";
import {useRouter} from "next/navigation";


export default function BusinessCreatePage() {
    const router = useRouter();
    const handleBack = () => {
        router.push(`/business`);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Crear Negocio" onBack={handleBack}/>
            <BusinessForm />
        </div>
    );
}

