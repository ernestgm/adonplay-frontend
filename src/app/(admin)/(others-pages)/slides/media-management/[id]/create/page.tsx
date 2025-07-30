"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React from 'react';
import {useParams, useRouter} from "next/navigation";
import SlideMediaForm from "@/components/app/slides/form/SlideMediaForm";

const SlideMediaCreatePage = () => {
    const params = useParams();
    const slideId = params.id; // Get the slide ID from the URL
    const router = useRouter();
    const handleBack = () => {
        router.push(`/slides/media-management/${slideId}`);
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Create Slide Media" onBack={handleBack}/>
            <SlideMediaForm slideId={slideId} />
        </div>
    );
};

export default SlideMediaCreatePage;