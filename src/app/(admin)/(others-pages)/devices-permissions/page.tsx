import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import React from "react";
import type {Metadata} from "next";
import DevicesPermissionsTable from "@/components/app/devices/tables/DevicesPermissionsTable";

export const metadata: Metadata = {
    title: `Devices Permissions | ${process.env.NAME_PAGE}`,
    description: `This is Devices Permissions Page in ${process.env.NAME_PAGE}`,
};
export default function DevicesPage() {
  return (
      <div>
          <PageBreadcrumb pageTitle="Devices Permissions" />
          <div className="space-y-6">
              <ComponentCard title="Devices Permissions">
                  <DevicesPermissionsTable />
              </ComponentCard>
          </div>
      </div>
  );
}
