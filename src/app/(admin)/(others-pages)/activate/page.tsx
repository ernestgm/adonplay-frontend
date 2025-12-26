import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import ActivatePageContent from "@/components/pages/ActivatePageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.activate");
}

export default function DevicesPage() {
  return <ActivatePageContent/>;
}
