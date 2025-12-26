"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {useParams, useRouter} from "next/navigation";
import SlideMediaForm from "@/components/app/slides/form/SlideMediaForm";
import { useT } from "@/i18n/I18nProvider";

const SlidesMediaCreatePageContent = () => {
    const params = useParams();
    const slideId = params.id; // Get the slide ID from the URL
  const router = useRouter();
  const tActions = useT("common.table.actions");
  const tCommon = useT("common.buttons");

  const handleBack = () => {
    router.push(`/slides/media-management/${slideId}`);
  };

  const title = `${tActions("mediaManagement")} · ${tCommon("create")}`;

  return (
    <div>
      <PageBreadcrumb pageTitle={title} onBack={handleBack} />
      <SlideMediaForm slideId={slideId} />
    </div>
  );
};

export default SlidesMediaCreatePageContent;
