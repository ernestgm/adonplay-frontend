"use client"

import React from "react";
import UserForm from "@/components/app/user/form/UserForm";
import type {Metadata} from "next";
import {useRouter} from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const CreateUserPage = () => {
    const router = useRouter();
    const handleBack = () => {
        router.push(`/users`);
    };

  return (
    <div>
        <PageBreadcrumb pageTitle="Crear User" onBack={handleBack}/>
        <UserForm />
    </div>
  );
};

export default CreateUserPage;
