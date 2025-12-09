"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, {useEffect, useState} from 'react';
import {useError} from "@/context/ErrorContext";
import {useParams, useRouter} from "next/navigation";
import MarqueesForm from "@/components/app/marquees/form/MarqueesForm";
import {getMarquees} from "@/server/api/marquees";

const MarqueesEditPage = () => {
    const params = useParams();
    const id = params.id; // El ID de la URL
    const setError = useError().setError;
    // Obtener el id de la URL
    const [loading, setLoading] = useState(true);
    const [marquee, setMarquee] = useState(null);
    // Obtener el negocio a editar (puedes mejorar esto usando SWR o React Query si lo usas en el proyecto)
    const router = useRouter();
    const handleBack = () => {
        router.push(`/marquees`);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getMarquees(id);
                setMarquee(data);
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
            <PageBreadcrumb pageTitle="Editar Marquee" onBack={handleBack} />
            <MarqueesForm marquee={marquee} />
        </div>
    );
};

export default MarqueesEditPage;

