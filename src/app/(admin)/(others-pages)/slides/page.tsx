import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import React, {Suspense} from "react";
import type {Metadata} from "next";
import SlidesTable from "@/components/app/slides/tables/SlidesTable";

export const metadata: Metadata = {
    title: `Slides | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is Slides Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};
export default function BusinessPage() {
  return (
      <div>
          <PageBreadcrumb pageTitle="Slides" />
          <div className="space-y-6">
              <ComponentCard title="Slides">
                  <SlidesTable />
              </ComponentCard>
          </div>
      </div>
  );
}

