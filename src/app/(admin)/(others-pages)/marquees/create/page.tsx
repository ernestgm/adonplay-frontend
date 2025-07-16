import React from "react";
import MarqueesForm from "@/components/app/marquees/form/MarqueesForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: `Create Marquees | ${process.env.NAME_PAGE}`,
    description: `This is Create Marquees Page in ${process.env.NAME_PAGE}`,
};
export default function MarqueeCreatePage () {
    return (
        <div>
            <PageBreadcrumb pageTitle="Crear Marquee" />
            <MarqueesForm />
        </div>
    );
};
