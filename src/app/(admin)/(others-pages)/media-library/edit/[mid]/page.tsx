"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, {useEffect, useState} from 'react';
import {useError} from "@/context/ErrorContext";
import {useParams, useRouter} from "next/navigation";
import MarqueesForm from "@/components/app/marquees/form/MarqueesForm";
import {getMarquees} from "@/server/api/marquees";
import {getQrCode} from "@/server/api/qrcodes";
import QrCodeForm from "@/components/app/qrcodes/form/QrCodeForm";
import {getMedia} from "@/server/api/media";
import SlideMediaForm from "@/components/app/slides/form/SlideMediaForm";
import MediaForm from "@/components/app/media/form/MediaForm";

const MediaEditPage = () => {
    const params = useParams();
    const slide = params.id; // El ID de la URL
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
            } catch (err) {
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

