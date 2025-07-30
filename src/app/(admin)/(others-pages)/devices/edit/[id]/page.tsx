"use client";

import React, {useEffect, useState} from "react";
import UserForm from "@/components/app/user/form/UserForm";
import { getUser } from "@/server/api/users";
import { useError } from "@/context/ErrorContext";
import {useParams, useRouter} from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {getDevice} from "@/server/api/devices";
import DeviceForm from "@/components/app/devices/form/DeviceForm";

const EditUserPage = () => {
    const params = useParams();
    const id = params.id; // El ID de la URL
    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const setError = useError().setError;

    const router = useRouter();
    const handleBack = () => {
        router.push(`/devices`);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getDevice(id);
                setDevice(data);
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
            <PageBreadcrumb pageTitle="Edit Device" onBack={handleBack} />
            <DeviceForm device={device} />
        </div>
    );
};

export default EditUserPage;
