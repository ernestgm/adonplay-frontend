import BusinessForm from '@/components/app/business/form/BusinessForm';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import React from 'react';
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: `Create Business | ${process.env.NAME_PAGE}`,
    description: `This is Create Business Page in ${process.env.NAME_PAGE}`,
};
export default function BusinessCreatePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Crear Negocio" />
      <BusinessForm />
    </div>
  );
}

