import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import React, {Suspense} from "react";
import type {Metadata} from "next";
import QrCodesTable from "@/components/app/qrcodes/tables/QrCodesTable";

export const metadata: Metadata = {
    title: `QrCodes | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is QrCodes Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};
export default function QrCodesPage() {
  return (
      <div>
          <PageBreadcrumb pageTitle="Qr Codes" />
          <div className="space-y-6">
              <ComponentCard title="Qr Codes">
                  <QrCodesTable />
              </ComponentCard>
          </div>
      </div>
  );
}

