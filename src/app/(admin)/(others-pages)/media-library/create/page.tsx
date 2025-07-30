"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React from 'react';
import {useParams, useRouter} from "next/navigation";
import SlideMediaForm from "@/components/app/slides/form/SlideMediaForm";
import MediaForm from "@/components/app/media/form/MediaForm";

const MediaCreatePage = () => {
    const params = useParams();
    const id = params.id; // El ID de la URL

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

