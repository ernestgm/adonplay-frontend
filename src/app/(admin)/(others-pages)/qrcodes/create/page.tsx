import React from "react";
import MarqueesForm from "@/components/app/marquees/form/MarqueesForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import type {Metadata} from "next";
import QrCodeForm from "@/components/app/qrcodes/form/QrCodeForm";

export const metadata: Metadata = {
    title: `Create Qr | ${process.env.NAME_PAGE}`,
    description: `This is Create Qr Page in ${process.env.NAME_PAGE}`,
};
export default function MarqueeCreatePage () {
    return (
        <div>
            <PageBreadcrumb pageTitle="Crear Qr Code" />
            <QrCodeForm />
        </div>
    );
};
