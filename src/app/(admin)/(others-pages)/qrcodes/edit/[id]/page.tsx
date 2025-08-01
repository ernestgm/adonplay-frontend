"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, {useEffect, useState} from 'react';
import {useError} from "@/context/ErrorContext";
import {useParams, useRouter} from "next/navigation";
import MarqueesForm from "@/components/app/marquees/form/MarqueesForm";
import {getMarquees} from "@/server/api/marquees";
import {getQrCode} from "@/server/api/qrcodes";
import QrCodeForm from "@/components/app/qrcodes/form/QrCodeForm";

const QrCodeEditPage = () => {
    const params = useParams();
    const id = params.id; // El ID de la URL
    const setError = useError().setError;
    // Obtener el id de la URL
    const [loading, setLoading] = useState(true);
    const [qrcode, setQrCode] = useState(null);

    const router = useRouter();
    const handleBack = () => {
        router.push(`/qrcodes`);
    };

    // Obtener el negocio a editar (puedes mejorar esto usando SWR o React Query si lo usas en el proyecto)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getQrCode(id);
                setQrCode(data);
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
            <QrCodeForm qrcode={qrcode} />
        </div>
    );
};

export default QrCodeEditPage;

