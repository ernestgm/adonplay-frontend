import UserTable from "@/components/app/user/tables/UserTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import React from "react";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: `Users | ${process.env.NAME_PAGE}`,
    description: `This is Users Page in ${process.env.NAME_PAGE}`,
};
export default function UserPage() {
  return (
      <div>
          <PageBreadcrumb pageTitle="User" />
          <div className="space-y-6">
              <ComponentCard title="Users">
                  <UserTable />
              </ComponentCard>
          </div>
      </div>
  );
}
