import MarqueesTable from "@/components/app/marquees/tables/MarqueesTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {Suspense} from "react";

export const metadata = {
    title: `Marquees | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `Esta es la página de Marquees en ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};

export default function MarqueesPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Marquees" />
            <div className="space-y-6">
                <ComponentCard title="Marquees">
                    <MarqueesTable />
                </ComponentCard>
            </div>
        </div>
    );
}
