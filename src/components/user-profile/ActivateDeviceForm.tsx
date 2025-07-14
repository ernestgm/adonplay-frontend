"use client";

import React, {useState} from "react";
import Button from "@/components/ui/button/Button";
import {getDataUserAuth} from "@/server/api/auth";

const ActivateUserForm = ({userId}) => {
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">

            <div className="flex gap-2 justify-end">
                <Button type="submit" variant="primary" loading={loading}>
                    {userId ? "Guardar cambios" : "Crear usuario"}
                </Button>
            </div>
        </form>
    );
};

export default ActivateUserForm;
