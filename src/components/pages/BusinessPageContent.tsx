"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BusinessTable from "@/components/app/business/tables/BusinessTable";
import { useT } from "@/i18n/I18nProvider";

const BusinessPageContent: React.FC = () => {
  const t = useT("pages.business");
  return (
    <div>
      <PageBreadcrumb pageTitle={t("pageTitle")} />
      <div className="space-y-6">
        <ComponentCard title={t("cardTitle")}>
          <BusinessTable />
        </ComponentCard>
      </div>
    </div>
  );
};

export default BusinessPageContent;
