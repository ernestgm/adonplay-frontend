import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import React from "react";
import QrCodesTable from "@/components/app/qrcodes/tables/QrCodesTable";
import {useT} from "@/i18n/I18nProvider";


export default function QrCodesPageContent() {
    const tPage = useT("pages.qrcodes");
    return (
        <div>
            <PageBreadcrumb pageTitle={tPage("pageTitle")} />
            <div className="space-y-6">
                <ComponentCard title={tPage("cardTitle")}>
                    <QrCodesTable />
                </ComponentCard>
            </div>
        </div>
    );
}