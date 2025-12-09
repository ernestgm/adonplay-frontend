"use client"

import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React, {Suspense} from 'react';
import SlidesForm from "@/components/app/slides/form/SlidesForm";
import {useRouter} from "next/navigation";


export default function SlideCreatePage() {
    const router = useRouter();
    const handleBack = () => {
        router.push(`/slides`);
    };

  return (
    <div>
      <PageBreadcrumb pageTitle="Crear Slide" onBack={handleBack}/>
        <SlidesForm />
    </div>
  );
}

