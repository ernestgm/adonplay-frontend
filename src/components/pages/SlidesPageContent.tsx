"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import SlidesTable from "@/components/app/slides/tables/SlidesTable";
import { useT } from "@/i18n/I18nProvider";

const SlidesPageContent: React.FC = () => {
  const t = useT("pages.slides");
  return (
    <div>
      <PageBreadcrumb pageTitle={t("pageTitle")} />
      <div className="space-y-6">
        <ComponentCard title={t("cardTitle")}>
          <SlidesTable />
        </ComponentCard>
      </div>
    </div>
  );
};

export default SlidesPageContent;
