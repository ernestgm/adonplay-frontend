"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useRouter } from "next/navigation";
import MenuEditorForm from "@/components/app/menus/MenuEditorForm";

const CreateMenuPageContent: React.FC = () => {
  const router = useRouter();

  return (
    <div>
      <PageBreadcrumb pageTitle="Crear formmenu" onBack={() => router.push("/menus")} />
      <MenuEditorForm />
    </div>
  );
};

export default CreateMenuPageContent;
