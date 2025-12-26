"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import DevicesTable from "@/components/app/devices/tables/DevicesTable";
import { useT } from "@/i18n/I18nProvider";

const DevicesPageContent: React.FC = () => {
  const t = useT("pages.devices");
  return (
    <div>
      <PageBreadcrumb pageTitle={t("pageTitle")} />
      <div className="space-y-6">
        <ComponentCard title={t("cardTitle")}>
          <DevicesTable />
        </ComponentCard>
      </div>
    </div>
  );
};

export default DevicesPageContent;
