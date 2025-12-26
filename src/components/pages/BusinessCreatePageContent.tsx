"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BusinessTable from "@/components/app/business/tables/BusinessTable";
import { useT } from "@/i18n/I18nProvider";
import {useRouter} from "next/navigation";
import BusinessForm from "@/components/app/business/form/BusinessForm";

const BusinessCreatePageContent: React.FC = () => {
    const t = useT("pages.business");
    const router = useRouter();
    const handleBack = () => {
        router.push(`/business`);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle={t("createPageTitle")} onBack={handleBack}/>
            <BusinessForm />
        </div>
    );
};

export default BusinessCreatePageContent;