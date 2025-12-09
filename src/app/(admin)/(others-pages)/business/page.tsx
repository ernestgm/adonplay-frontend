import BusinessTable from "@/components/app/business/tables/BusinessTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import React, {Suspense} from "react";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: `Business | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is Business Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};
export default function BusinessPage() {
  return (
      <div>
          <PageBreadcrumb pageTitle="Business" />
          <div className="space-y-6">
              <ComponentCard title="Businesses">
                  <BusinessTable />
              </ComponentCard>
          </div>
      </div>
  );
}

