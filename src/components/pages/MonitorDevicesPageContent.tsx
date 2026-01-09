"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useT } from "@/i18n/I18nProvider";
import MonitorDevicesTable from "@/components/app/devices/tables/MonitorDevicesTable";

const MonitorDevicesPageContent: React.FC = () => {
  const t = useT("pages.monitorDevices");
  return (
    <div>
      <PageBreadcrumb pageTitle={t("pageTitle")} />
      <div className="space-y-6">
        <ComponentCard title={t("cardTitle")}>
          <MonitorDevicesTable />
        </ComponentCard>
      </div>
    </div>
  );
};

export default MonitorDevicesPageContent;
