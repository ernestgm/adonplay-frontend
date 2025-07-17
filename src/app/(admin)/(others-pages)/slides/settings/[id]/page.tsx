"use client";

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, {useEffect, useState} from 'react';
import {useError} from "@/context/ErrorContext";
import {useParams} from "next/navigation";
import {getSlide} from "@/server/api/slides";
import SlidesForm from "@/components/app/slides/form/SlidesForm";

const SlidesEditPage = () => {
    const params = useParams();
    const id = params.id; // El ID de la URL
    const setError = useError().setError;
    // Obtener el id de la URL
    const [loading, setLoading] = useState(true);
    const [slide, setSlide] = useState(null);
    // Obtener el negocio a editar (puedes mejorar esto usando SWR o React Query si lo usas en el proyecto)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getSlide(id);
                setSlide(data);
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
            <PageBreadcrumb pageTitle="Slide Settings"/>
            <SlidesForm slides={slide} />
        </div>
    );
};

export default SlidesEditPage;

