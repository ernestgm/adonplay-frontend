"use client";

import React, {useEffect, useState} from "react";
import UserForm from "@/components/app/user/form/UserForm";
import { getUser } from "@/server/api/users";
import { useError } from "@/context/ErrorContext";
import {useParams, useRouter} from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const EditUserPage = () => {
    const params = useParams();
    const id = params.id; // El ID de la URL
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const setError = useError().setError;

    const router = useRouter();
    const handleBack = () => {
        router.push(`/users`);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getUser(id);
                console.log(data);
                setUser(data);
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
            <PageBreadcrumb pageTitle="Edit User" onBack={handleBack} />
            <UserForm user={user} />
        </div>
    );
};

export default EditUserPage;
