"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useError } from "@/context/ErrorContext";
import SlideMediaDetails from "@/components/app/slides/details/SlideMediaDetails";
import { getSlideMedias } from "@/server/api/slidesMedia";

const SlideMediaDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const slideId = params.id; // Get the slide ID from the URL
    const mediaId = params.mediaId; // Get the media ID from the URL
    const [slideMedia, setSlideMedia] = useState(null);
    const [loading, setLoading] = useState(true);
    const setError = useError().setError;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getSlideMedias(mediaId);
                setSlideMedia(data);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error al cargar media");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [mediaId, setError]);

    const handleBack = () => {
        router.push(`/slides/media-management/${slideId}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Slide Media Details" onBack={handleBack} />
            {slideMedia && <SlideMediaDetails slideMedia={slideMedia} />}
        </div>
    );
};

export default SlideMediaDetailsPage;