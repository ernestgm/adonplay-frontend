import React from 'react';
import { generatePageMetadata } from "@/i18n/metadata";
import EditPricesPageContent from "@/components/pages/EditPricesPageContent";

export async function generateMetadata() {
    return generatePageMetadata("pages.mediaLibrary");
}

export default function EditPricesPage() {
    return <EditPricesPageContent/>;
}
