"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserForm from "@/components/app/user/form/UserForm";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

const UsersCreatePageContent: React.FC = () => {
  const router = useRouter();
  const tPage = useT("pages.users");

  const handleBack = () => {
    router.push(`/users`);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={tPage("createPageTitle")} onBack={handleBack} />
      <UserForm />
    </div>
  );
};

export default UsersCreatePageContent;
