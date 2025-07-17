"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React from 'react';
import {useParams} from "next/navigation";
import MediaForm from "@/components/app/slides/form/MediaForm";

const MediaCreatePage = () => {
    const params = useParams();
    const id = params.id; // El ID de la URL

    return (
        <div>
            <PageBreadcrumb pageTitle="Crear Media"/>
            <MediaForm slideId={id} />
        </div>
    );
};

export default MediaCreatePage;

