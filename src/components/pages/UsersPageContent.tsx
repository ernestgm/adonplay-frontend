"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import UserTable from "@/components/app/user/tables/UserTable";
import { useT } from "@/i18n/I18nProvider";

const UsersPageContent: React.FC = () => {
  const t = useT("pages.users");
  return (
    <div>
      <PageBreadcrumb pageTitle={t("pageTitle")} />
      <div className="space-y-6">
        <ComponentCard title={t("cardTitle")}>
          <UserTable />
        </ComponentCard>
      </div>
    </div>
  );
};

export default UsersPageContent;
