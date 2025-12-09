"use client";

import BusinessForm from '@/components/app/business/form/BusinessForm';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, {useEffect, useState} from 'react';
import {getBusiness} from '@/server/api/business';
import {useError} from "@/context/ErrorContext";
import {useParams, useRouter} from "next/navigation";

const BusinessEditPage = () => {
    const params = useParams();
    const id = params.id; // El ID de la URL
    const setError = useError().setError;
    // Obtener el id de la URL
    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState(null);
    // Obtener el negocio a editar (puedes mejorar esto usando SWR o React Query si lo usas en el proyecto)
    const router = useRouter();
    const handleBack = () => {
        router.push(`/business`);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getBusiness(id);
                setBusiness(data);
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
            <PageBreadcrumb pageTitle="Editar Negocio" onBack={handleBack}/>
            <BusinessForm business={business}/>
        </div>
    );
};

export default BusinessEditPage;

