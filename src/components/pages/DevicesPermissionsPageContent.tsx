"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import DevicesPermissionsTable from "@/components/app/devices/tables/DevicesPermissionsTable";
import { useT } from "@/i18n/I18nProvider";

const DevicesPermissionsPageContent: React.FC = () => {
  const t = useT("pages.devicesPermissions");
  return (
    <div>
      <PageBreadcrumb pageTitle={t("pageTitle")} />
      <div className="space-y-6">
        <ComponentCard title={t("cardTitle")}>
          <DevicesPermissionsTable />
        </ComponentCard>
      </div>
    </div>
  );
};

export default DevicesPermissionsPageContent;
