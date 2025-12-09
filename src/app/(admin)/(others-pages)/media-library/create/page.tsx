"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, {Suspense} from 'react';
import {useRouter} from "next/navigation";
import MediaForm from "@/components/app/media/form/MediaForm";

const MediaCreatePage = () => {
    const router = useRouter();
    const handleBack = () => {
        router.push(`/media-library`);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Crear Media" onBack={handleBack}/>
            <MediaForm />
        </div>
    );
};

export default MediaCreatePage;

