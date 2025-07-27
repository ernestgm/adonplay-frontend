"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React from 'react';
import {useParams} from "next/navigation";
import SlideMediaTables from "@/components/app/slides/tables/SlideMediaTables";
import ComponentCard from "@/components/common/ComponentCard";

const SlidesEditPage = () => {
    const params = useParams();
    const id = params.id; // El ID de la URL

    return (
        <div>
            <PageBreadcrumb pageTitle="Medias Management"/>
            <ComponentCard title="Medias">
                <SlideMediaTables slide={id} />
            </ComponentCard>
        </div>
    );
};

export default SlidesEditPage;

