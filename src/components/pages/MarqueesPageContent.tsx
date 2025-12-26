"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useT } from "@/i18n/I18nProvider";
import MarqueesTable from "@/components/app/marquees/tables/MarqueesTable";

const MarqueesPageContent: React.FC = () => {
    const t = useT("pages.marquees");
    return (
        <div>
            <PageBreadcrumb pageTitle={t("pageTitle")} />
            <div className="space-y-6">
                <ComponentCard title={t("cardTitle")}>
                    <MarqueesTable />
                </ComponentCard>
            </div>
        </div>
    );
};

export default MarqueesPageContent;