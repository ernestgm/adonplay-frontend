import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import DevicesPageContent from "@/components/pages/DevicesPageContent";

export async function generateMetadata() {
    return generatePageMetadata("pages.devices");
}
export default function DevicesPage() {
  return <DevicesPageContent/>;
}
