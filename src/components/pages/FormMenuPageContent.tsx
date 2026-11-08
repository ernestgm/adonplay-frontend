"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import FormMenuTable from "@/components/app/menus/FormMenuTable";

const FormMenuPageContent: React.FC = () => {
  return (
    <div>
      <PageBreadcrumb pageTitle="formmenu" />
      <div className="space-y-6">
        <ComponentCard title="formmenu">
          <FormMenuTable />
        </ComponentCard>
      </div>
    </div>
  );
};

export default FormMenuPageContent;
