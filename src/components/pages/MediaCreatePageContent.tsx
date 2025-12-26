"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MediaForm from "@/components/app/media/form/MediaForm";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

const MediaCreatePageContent: React.FC = () => {
  const router = useRouter();
  const tPage = useT("pages.mediaLibrary");

  const handleBack = () => {
    router.push(`/media-library`);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={tPage("createPageTitle")} onBack={handleBack} />
      <MediaForm />
    </div>
  );
};

export default MediaCreatePageContent;
