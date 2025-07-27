"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React from 'react';
import { useParams } from "next/navigation";
import SlideMediaForm from "@/components/app/slides/form/SlideMediaForm";

const SlideMediaCreatePage = () => {
    const params = useParams();
    const slideId = params.id; // Get the slide ID from the URL

    return (
        <div>
            <PageBreadcrumb pageTitle="Create Slide Media"/>
            <SlideMediaForm slideId={slideId} />
        </div>
    );
};

export default SlideMediaCreatePage;