"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MarqueesForm from "@/components/app/marquees/form/MarqueesForm";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

const MarqueesCreatePageContent: React.FC = () => {
  const router = useRouter();
  const tPage = useT("pages.marquees");

  const handleBack = () => {
    router.push(`/marquees`);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={tPage("createPageTitle")} onBack={handleBack} />
      <MarqueesForm />
    </div>
  );
};

export default MarqueesCreatePageContent;
