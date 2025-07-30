"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React from 'react';
import {useParams, useRouter} from "next/navigation";
import SlideMediaTables from "@/components/app/slides/tables/SlideMediaTables";
import ComponentCard from "@/components/common/ComponentCard";

const SlidesEditPage = () => {
    const params = useParams();
    const id = params.id; // El ID de la URL
    const router = useRouter();
    const handleBack = () => {
        router.push(`/slides`);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Medias Management" onBack={handleBack}/>
            <ComponentCard title="Medias">
                <SlideMediaTables slide={id} />
            </ComponentCard>
        </div>
    );
};

export default SlidesEditPage;

