"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import MediaTable from "@/components/app/media/tables/MediaTables";
import { useT } from "@/i18n/I18nProvider";

const MediaLibraryPageContent: React.FC = () => {
  const t = useT("pages.mediaLibrary");
  return (
    <div>
      <PageBreadcrumb pageTitle={t("pageTitle")} />
      <div className="space-y-6">
        <ComponentCard title={t("cardTitle")}>
          <MediaTable />
        </ComponentCard>
      </div>
    </div>
  );
};

export default MediaLibraryPageContent;
