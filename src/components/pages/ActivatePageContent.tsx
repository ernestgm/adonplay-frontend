"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ActivateDeviceForm from "@/components/user-profile/ActivateDeviceForm";
import { useT } from "@/i18n/I18nProvider";

const ActivatePageContent: React.FC = () => {
  const t = useT("pages.activate");
  return (
    <div>
      <PageBreadcrumb pageTitle={t("pageTitle")} />
      <div className="space-y-6">
        <ComponentCard title={t("cardTitle")}>
          <ActivateDeviceForm />
        </ComponentCard>
      </div>
    </div>
  );
};

export default ActivatePageContent;
