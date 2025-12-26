"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import QrCodeForm from "@/components/app/qrcodes/form/QrCodeForm";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

const QrCodesCreatePageContent: React.FC = () => {
  const router = useRouter();
  const tPage = useT("pages.qrcodes");

  const handleBack = () => {
    router.push(`/qrcodes`);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={tPage("createPageTitle")} onBack={handleBack} />
      <QrCodeForm />
    </div>
  );
};

export default QrCodesCreatePageContent;
