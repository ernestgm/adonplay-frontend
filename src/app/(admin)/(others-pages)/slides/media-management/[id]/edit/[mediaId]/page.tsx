"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, { useEffect, useState } from 'react';
import {useParams, useRouter} from "next/navigation";
import { useError } from "@/context/ErrorContext";
import SlideMediaForm from "@/components/app/slides/form/SlideMediaForm";
import { getSlideMedias } from "@/server/api/slidesMedia";

const SlideMediaEditPage = () => {
    const params = useParams();
    const slideId = params.id; // Get the slide ID from the URL
    const mediaId = params.mediaId; // Get the media ID from the URL
    const [media, setMedia] = useState(null);
    const [loading, setLoading] = useState(true);
    const setError = useError().setError;
    const router = useRouter();

    const handleBack = () => {
        router.push(`/slides/media-management/${slideId}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getSlideMedias(mediaId);
                setMedia(data);
            } catch (err) {
                setError(err.data?.message || err.message || "Error al cargar media");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [mediaId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Edit Slide Media" onBack={handleBack}/>
            {media && <SlideMediaForm slideId={slideId} slideMedia={media} />}
        </div>
    );
};

export default SlideMediaEditPage;