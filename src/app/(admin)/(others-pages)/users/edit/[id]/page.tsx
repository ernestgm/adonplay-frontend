"use client";
import React, {useEffect, useState} from "react";
import { useParams } from "next/navigation";
import UserForm from "@/components/user-profile/UserForm";
import { getUser } from "@/server/api/users";
import { useError } from "@/context/ErrorContext";

const EditUserPage = () => {
    const params = useParams();
    const id = params.id; // El ID de la URL
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const setError = useError().setError;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getUser(id);
                console.log(data);
                setUser(data);
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
        <div className="py-8">
            <UserForm user={user} />
        </div>
    );
};

export default EditUserPage;
