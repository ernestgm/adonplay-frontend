"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, {useEffect, useState} from 'react';
import {useError} from "@/context/ErrorContext";
import {useParams, useRouter} from "next/navigation";
import {getMedia} from "@/server/api/media";
import MediaForm from "@/components/app/media/form/MediaForm";

const MediaEditPage = () => {
    const params = useParams();
    const id = params.mid; // El ID de la URL
    const setError = useError().setError;
    // Obtener el id de la URL
    const [loading, setLoading] = useState(true);
    const [media, setMedia] = useState(null);

    const router = useRouter();
    const handleBack = () => {
        router.push(`/media-library`);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getMedia(id);
                console.log(data);
                setMedia(data);
            } catch (err: any) {
                setError(err.data?.message || err.message || "Error al obtener usuario");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Editar Marquee" onBack={handleBack}/>
            <MediaForm media={media} />
        </div>
    );
};

export default MediaEditPage;

