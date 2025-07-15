import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React from 'react';
import type {Metadata} from "next";
import SlidesForm from "@/components/app/slides/form/SlidesForm";

export const metadata: Metadata = {
    title: `Create Slide | ${process.env.NAME_PAGE}`,
    description: `This is Create Slide Page in ${process.env.NAME_PAGE}`,
};
export default function SlideCreatePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Crear Slide" />
        <SlidesForm />
    </div>
  );
}

