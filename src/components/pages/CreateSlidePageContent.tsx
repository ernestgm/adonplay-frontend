"use client"

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React from 'react';
import SlidesForm from "@/components/app/slides/form/SlidesForm";
import {useRouter} from "next/navigation";
import { useT } from "@/i18n/I18nProvider";


export default function CreateSlidePageContent() {
  const router = useRouter();
  const tPage = useT("pages.slides");

  const handleBack = () => {
    router.push(`/slides`);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={tPage("createPageTitle")} onBack={handleBack} />
      <SlidesForm />
    </div>
  );
}

