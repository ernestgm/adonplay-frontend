import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import React, {Suspense} from "react";
import type {Metadata} from "next";
import DevicesTable from "@/components/app/devices/tables/DevicesTable";

export const metadata: Metadata = {
    title: `Devices | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is Devices Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};
export default function DevicesPage() {
  return (
      <div>
          <PageBreadcrumb pageTitle="Devices" />
          <div className="space-y-6">
              <ComponentCard title="Devices">
                  <DevicesTable />
              </ComponentCard>
          </div>
      </div>
  );
}
