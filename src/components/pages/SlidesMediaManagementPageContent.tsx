"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import SlideMediaTables from "@/components/app/slides/tables/SlideMediaTables";
import {useParams, useRouter} from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

const SlidesMediaManagementPageContent = () => {
    const params = useParams();
    const id = params.id;
  const router = useRouter();
  const tActions = useT("common.table.actions");

  const handleBack = () => {
    router.push(`/slides`);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={tActions("mediaManagement")} onBack={handleBack} />
      <ComponentCard title={tActions("mediaManagement")}>
        <SlideMediaTables slide={id} />
      </ComponentCard>
    </div>
  );
};

export default SlidesMediaManagementPageContent;
