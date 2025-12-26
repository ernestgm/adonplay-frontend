import React from "react";
import {generatePageMetadata} from "@/i18n/metadata";
import MarqueesPageContent from "@/components/pages/MarqueesPageContent";

export async function generateMetadata() {
    return generatePageMetadata("pages.marquees");
}

export default function MarqueesPage() {
    return <MarqueesPageContent/>;
}
