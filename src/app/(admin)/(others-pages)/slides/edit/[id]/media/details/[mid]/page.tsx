"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, {useEffect, useState} from 'react';
import {useError} from "@/context/ErrorContext";
import {useParams, useRouter} from "next/navigation";
import {getMedia} from "@/server/api/media";
import MediaDetails from "@/components/app/slides/details/MediaDetails";

const MediaDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const slide = params.id; // El ID de la URL
    const id = params.mid; // El ID de la URL
    const setError = useError().setError;
    const [loading, setLoading] = useState(true);
    const [media, setMedia] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getMedia(slide, id);
                console.log(data);
                setMedia(data);
            } catch (err) {
                setError(err.data?.message || err.message || "Error al obtener media");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, slide, setError]);

    const handleBack = () => {
        router.push(`/slides/edit/${slide}`);
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Detalles de Media"/>
            <MediaDetails media={media} onBack={handleBack} />
        </div>
    );
};

export default MediaDetailsPage;