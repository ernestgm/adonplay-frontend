import React from 'react';
import { generatePageMetadata } from "@/i18n/metadata";
import DetailsMediaPageContent from "@/components/pages/DetailsMediaPageContent";

export async function generateMetadata() {
    return generatePageMetadata("pages.mediaLibrary");
}

export default function MediaCreatePage() {
    return <DetailsMediaPageContent/>;
}